import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, Sparkles, AlertCircle, X } from 'lucide-react';
import { floatTo16BitPCM, arrayBufferToBase64, base64ToArrayBuffer, createAudioBufferFromPCM } from '../utils/audioPcm';
import { LocationData } from '../types/garden';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  location
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState('Connecting to Live Voice API...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef(false);

  isMutedRef.current = isMuted;

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    startLiveSession();

    return () => {
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch {}
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    activeSourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {}
    });
    activeSourcesRef.current = [];
    setIsConnected(false);
    setIsSpeaking(false);
  };

  const startLiveSession = async () => {
    setErrorMessage(null);
    setStatusText('Requesting microphone & connecting...');

    try {
      // 1. Get user microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      // 2. Setup AudioContexts: 16kHz for mic input, 24kHz for Live API model output
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const outputCtx = new AudioCtx({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputCtx;
      nextPlayTimeRef.current = outputCtx.currentTime;

      // 3. Connect WebSocket to backend /live route
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setStatusText('Connected to gemini-3.8-live. Speak to your garden advisor!');
        
        // Send initial context greeting
        ws.send(JSON.stringify({
          text: `User is gardening in ${location.name} (${location.usdaZone}), with Last Spring Frost ${location.lastSpringFrost} and First Fall Frost ${location.firstFallFrost}. Say hello briefly and ask what they'd like to plant or prepare today.`
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.error) {
            setErrorMessage(msg.error);
            setStatusText('Connection error');
          }

          if (msg.interrupted) {
            // User interrupted model speaking: stop all current sources
            activeSourcesRef.current.forEach((src) => {
              try {
                src.stop();
              } catch {}
            });
            activeSourcesRef.current = [];
            if (outputCtx) {
              nextPlayTimeRef.current = outputCtx.currentTime;
            }
            setIsSpeaking(false);
          }

          if (msg.audio) {
            playAudioChunk(outputCtx, msg.audio);
          }
        } catch (e) {
          console.error('[Live] Error parsing incoming message', e);
        }
      };

      ws.onerror = (e) => {
        console.error('[Live] WebSocket error', e);
        setErrorMessage('Failed to connect to Live API server.');
        setStatusText('Connection failed');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setStatusText('Call ended');
      };

      // 4. Hook microphone processor for streaming PCM audio to server
      const sourceNode = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current) return;
        if (ws.readyState !== WebSocket.OPEN) return;

        const inputChannel = e.inputBuffer.getChannelData(0);
        const pcm16Buffer = floatTo16BitPCM(inputChannel);
        const base64Audio = arrayBufferToBase64(pcm16Buffer);

        ws.send(JSON.stringify({ audio: base64Audio }));
      };

      sourceNode.connect(processor);
      processor.connect(inputCtx.destination);

    } catch (err: any) {
      console.error('[Live] Setup error:', err);
      setErrorMessage(err.message || 'Microphone access denied or connection failed.');
      setStatusText('Error');
    }
  };

  const playAudioChunk = (ctx: AudioContext, base64Audio: string) => {
    try {
      const pcmBuffer = base64ToArrayBuffer(base64Audio);
      const audioBuffer = createAudioBufferFromPCM(pcmBuffer, ctx, 24000);

      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(ctx.destination);

      const now = ctx.currentTime;
      const startTime = Math.max(now, nextPlayTimeRef.current);
      sourceNode.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      activeSourcesRef.current.push(sourceNode);
      setIsSpeaking(true);

      sourceNode.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== sourceNode);
        if (activeSourcesRef.current.length === 0) {
          setIsSpeaking(false);
        }
      };
    } catch (err) {
      console.error('[Live] Error playing audio chunk', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Indicator */}
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
          <Sparkles className="w-3.5 h-3.5" />
          <span>gemini-3.8-live Real-Time Voice</span>
        </div>

        <h3 className="text-xl font-serif font-bold text-white text-center mb-1">
          Garden Voice Assistant
        </h3>
        <p className="text-xs text-stone-400 text-center mb-6">
          Calibrated for {location.name} ({location.usdaZone})
        </p>

        {/* Central Audio Visualizer Orb */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Animated glow rings when speaking or listening */}
          <div
            className={`absolute w-36 h-36 rounded-full transition-all duration-500 ${
              isSpeaking
                ? 'bg-emerald-500/20 animate-ping'
                : isConnected
                ? 'bg-emerald-600/10 animate-pulse'
                : 'bg-stone-800/30'
            }`}
          />
          <div
            className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${
              isSpeaking
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 scale-105'
                : isConnected
                ? 'bg-gradient-to-tr from-stone-800 to-emerald-900 scale-100'
                : 'bg-stone-800 scale-95'
            }`}
          >
            {isSpeaking ? (
              <Volume2 className="w-12 h-12 text-white animate-bounce" />
            ) : isMuted ? (
              <MicOff className="w-10 h-10 text-rose-400" />
            ) : (
              <Mic className="w-10 h-10 text-emerald-300 animate-pulse" />
            )}
          </div>
        </div>

        {/* Status text */}
        <div className="text-center my-4">
          <div className="text-sm font-medium text-stone-200">
            {isSpeaking ? 'Advisor is speaking...' : isConnected ? (isMuted ? 'Microphone muted' : 'Listening... Speak naturally') : statusText}
          </div>
          <div className="text-xs text-stone-400 mt-1 max-w-xs">
            Ask: "What greens can I sow this week?" or "When should I plant garlic?"
          </div>
        </div>

        {errorMessage && (
          <div className="w-full p-2.5 mb-4 bg-rose-950/50 border border-rose-800/60 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex items-center gap-4 mt-2">
          {/* Mute Toggle */}
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            disabled={!isConnected}
            className={`p-3.5 rounded-full border transition-all ${
              isMuted
                ? 'bg-rose-900/60 border-rose-700 text-rose-200 hover:bg-rose-800'
                : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium text-xs transition-colors shadow-lg"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Voice Call</span>
          </button>
        </div>

      </div>
    </div>
  );
};
