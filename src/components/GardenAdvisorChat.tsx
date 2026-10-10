import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, Sparkles, MapPin, Search, Compass, Loader2, ExternalLink } from 'lucide-react';
import { LocationData, CurrentSeasonState } from '../types/garden';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  groundingUrls?: Array<{ uri: string; title: string }>;
  timestamp: string;
}

interface GardenAdvisorChatProps {
  location: LocationData;
  seasonState: CurrentSeasonState;
  onOpenVoiceCall: () => void;
}

export const GardenAdvisorChat: React.FC<GardenAdvisorChatProps> = ({
  location,
  seasonState,
  onOpenVoiceCall
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your Horticultural Consultant for **${location.name} (${location.usdaZone})**.\n\nYour average Last Spring Frost is **${location.lastSpringFrost}** and First Fall Frost is **${location.firstFallFrost}**. Current phase: **${seasonState.seasonPhaseLabel}**.\n\nAsk me anything about what to sow right now, cold protection techniques, companion planting, or diagnosing plant issues!`,
      modelUsed: 'gemini-3.5-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [modelChoice, setModelChoice] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [isLoading, setIsLoading] = useState(false);

  // Audio Transcription state (gemini-3.5-transcribe)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // FEATURE 5: AUDIO TRANSCRIPTION USING gemini-3.5-transcribe
  const handleToggleRecord = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          // Clean up stream tracks
          stream.getTracks().forEach((t) => t.stop());

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (audioBlob.size === 0) return;

          setIsTranscribing(true);

          try {
            // Convert to base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64data = (reader.result as string).split(',')[1];
              
              const res = await fetch('/api/gemini/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64data,
                  mimeType: 'audio/webm'
                })
              });

              const data = await res.json();
              if (data.transcript) {
                setInput((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
              }
              setIsTranscribing(false);
            };
          } catch (err) {
            console.error('Transcription failed', err);
            setIsTranscribing(false);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Microphone error', err);
      }
    }
  };

  // FEATURE 4: MULTI-TURN CHAT (gemini-3.5-flash / gemini-3.1-pro-preview / gemini-3.1-flash-lite)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const newMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const historyPayload = [...messages, newMsg].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          modelChoice,
          contextInfo: {
            name: location.name,
            zone: location.usdaZone,
            springFrost: location.lastSpringFrost,
            fallFrost: location.firstFallFrost,
            seasonPhase: seasonState.seasonPhaseLabel
          }
        })
      });

      const data = await res.json();

      if (data.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.text,
            modelUsed: data.model || modelChoice,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: `Error: ${data.error}`,
            modelUsed: modelChoice,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to connect to the garden advisor. Please check connection.',
          modelUsed: modelChoice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick inquiry buttons
  const sendQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* Top Bar for Chat */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Garden Advisor Chat
            </h1>
            <span className="text-xs text-stone-500 dark:text-stone-400">· Multi-Turn Assistant</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Advising for {location.name} ({location.usdaZone}) · Last frost: {location.lastSpringFrost} · First frost: {location.firstFallFrost}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Model Switcher */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-medium">Model:</span>
            <select
              value={modelChoice}
              onChange={(e) => setModelChoice(e.target.value as any)}
              className="px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-800 dark:text-stone-200 text-xs font-mono focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="gemini-3.5-flash">gemini-3.5-flash (General)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            </select>
          </div>

          {/* Voice Conversation Launch Button */}
          <button
            onClick={onOpenVoiceCall}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800/60 rounded-md transition-colors"
            title="Start real-time voice call with gemini-3.8-live"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Live Voice Call</span>
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-2xs">
        {messages.map((m) => {
          const isUser = m.role === 'user';

          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-800 dark:bg-emerald-700 text-white flex items-center justify-center shrink-0 text-sm font-bold shadow-xs">
                  🌱
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-br-xs'
                    : 'bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Grounding URLs if present */}
                {m.groundingUrls && m.groundingUrls.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-stone-200 dark:border-stone-700 text-xs space-y-1">
                    <span className="font-semibold text-stone-600 dark:text-stone-400 block">Sources & Verified Links:</span>
                    {m.groundingUrls.map((g, idx) => (
                      <a
                        key={idx}
                        href={g.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{g.title || g.uri}</span>
                      </a>
                    ))}
                  </div>
                )}

                <div
                  className={`flex items-center justify-between gap-2 mt-2 pt-1 text-[10px] font-mono ${
                    isUser ? 'text-emerald-200' : 'text-stone-400 dark:text-stone-500'
                  }`}
                >
                  {!isUser && m.modelUsed && <span>Model: {m.modelUsed}</span>}
                  <span className="ml-auto">{m.timestamp}</span>
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-stone-700 dark:bg-stone-600 text-white flex items-center justify-center shrink-0 text-sm shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 dark:bg-emerald-700 text-white flex items-center justify-center shrink-0 text-sm font-bold">
              🌱
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-2xl rounded-bl-xs px-4 py-3 text-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700 dark:text-emerald-400" />
              <span>Consulting horticultural guide with {modelChoice}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-400 dark:text-stone-500 shrink-0">Quick questions:</span>
        <button
          onClick={() => sendQuickPrompt("Can I plant garlic this week, and how deep should I bury the cloves?")}
          className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md transition-colors whitespace-nowrap"
        >
          When to plant garlic?
        </button>
        <button
          onClick={() => sendQuickPrompt("What cold-protection should I use if a frost is expected in 5 days?")}
          className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md transition-colors whitespace-nowrap"
        >
          Frost protection tips
        </button>
        <button
          onClick={() => sendQuickPrompt("What are the best companion plants to grow next to tomatoes in my zone?")}
          className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md transition-colors whitespace-nowrap"
        >
          Tomato companion planting
        </button>
        <button
          onClick={() => sendQuickPrompt("How do I test my soil temperature before direct sowing carrots and spinach?")}
          className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-md transition-colors whitespace-nowrap"
        >
          Soil temp testing
        </button>
      </div>

      {/* Input Form with Audio Transcription Mic */}
      <form onSubmit={handleSendMessage} className="bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-2">
        
        {/* Microphone button for gemini-3.5-transcribe */}
        <button
          type="button"
          onClick={handleToggleRecord}
          disabled={isTranscribing}
          className={`p-2.5 rounded-lg border transition-all ${
            isRecording
              ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
              : isTranscribing
              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
          }`}
          title={isRecording ? 'Stop Recording' : 'Dictate with Microphone (gemini-3.5-transcribe)'}
        >
          {isRecording ? (
            <MicOff className="w-4 h-4" />
          ) : isTranscribing ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-700 dark:text-amber-400" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isRecording
              ? 'Recording audio... Click mic to transcribe with gemini-3.5-transcribe'
              : isTranscribing
              ? 'Transcribing audio...'
              : 'Ask a question or dictate notes...'
          }
          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent focus:outline-hidden text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-lg transition-colors shadow-2xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
