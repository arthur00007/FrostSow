import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Body parsers (with generous limit for audio payloads)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize GoogleGenAI client on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// WebSocket Server for Gemini Live API voice conversations
const wss = new WebSocketServer({ server, path: '/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live API] Client connected to /live');
  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Aoede' }
          }
        },
        systemInstruction:
          'You are FrostSow Garden Voice Assistant, an expert botanical guide and planting advisor. You speak naturally to gardeners about what to sow, local frost dates, seed germination, soil temperatures, and winter protection. Keep your responses concise, practical, and conversational.'
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
          if (message.serverContent?.turnComplete && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ turnComplete: true }));
          }
        },
        onerror: (err: any) => {
          console.error('[Live API] Session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ error: err?.message || 'Live session error' }));
          }
        },
        onclose: () => {
          console.log('[Live API] Session closed');
        }
      }
    });

    clientWs.send(JSON.stringify({ connected: true, model: 'gemini-3.8-live' }));
  } catch (err: any) {
    console.error('[Live API] Failed to connect live session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: err?.message || 'Could not connect to Live API' }));
    }
    return;
  }

  clientWs.on('message', (data: Buffer | string) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (session) {
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' }
          });
        } else if (parsed.text) {
          session.sendRealtimeInput({
            text: parsed.text
          });
        }
      }
    } catch (e) {
      console.error('[Live API] Error parsing client message:', e);
    }
  });

  clientWs.on('close', () => {
    console.log('[Live API] Client disconnected');
    if (session && typeof session.close === 'function') {
      try {
        session.close();
      } catch {
        // ignore
      }
    }
  });
});

// FEATURE 4: MULTI-TURN CHATBOT (gemini-3.5-flash / gemini-3.1-pro-preview / gemini-3.1-flash-lite)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, modelChoice = 'gemini-3.5-flash', contextInfo } = req.body;

    const validModels = ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
    const model = validModels.includes(modelChoice) ? modelChoice : 'gemini-3.5-flash';

    const systemInstruction = `You are FrostSow's Master Horticultural Consultant and Garden Planning Assistant.
You specialize in advising gardeners on what crops to sow and transplant based on their specific local frost dates, USDA hardiness zones, and microclimates.
${contextInfo ? `Current User Context: Location: ${contextInfo.name}, Zone: ${contextInfo.zone}, Spring Frost: ${contextInfo.springFrost}, Fall Frost: ${contextInfo.fallFrost}, Current Season: ${contextInfo.seasonPhase}.` : ''}
Provide direct, scientifically sound botanical advice. Include specific soil temperature minimums, planting depths, frost tolerances (hardy, semi-hardy, tender), and companion planting tips where appropriate.`;

    // Map conversation into contents array
    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Hello!' }] });
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({
      text: response.text || '',
      model
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.status(500).json({ error: error.message || 'Failed to generate chat response' });
  }
});

// FEATURE 2: GOOGLE MAPS GROUNDING (gemini-3.5-flash with googleMaps tool)
app.post('/api/gemini/maps', async (req, res) => {
  try {
    const { prompt, lat, lon } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const config: any = {
      tools: [{ googleMaps: {} }]
    };

    if (lat !== undefined && lon !== undefined) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: Number(lat),
            longitude: Number(lon)
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config
    });

    // Extract grounding chunks
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      text: response.text || '',
      groundingChunks
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/maps:', error);
    res.status(500).json({ error: error.message || 'Failed to query Google Maps Grounding' });
  }
});

// FEATURE 3: GOOGLE SEARCH GROUNDING (gemini-3.5-flash with googleSearch tool)
app.post('/api/gemini/search', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      text: response.text || '',
      groundingChunks
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/search:', error);
    res.status(500).json({ error: error.message || 'Failed to query Google Search Grounding' });
  }
});

// FEATURE 5: AUDIO TRANSCRIPTION (gemini-3.5-transcribe)
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Please transcribe the spoken audio verbatim. Only return the transcribed text.' }
        ]
      }
    });

    res.json({
      transcript: response.text || ''
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/transcribe:', error);
    res.status(500).json({ error: error.message || 'Failed to transcribe audio' });
  }
});

// Vite middleware or static serving
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
}

setupVite().then(() => {
  server.listen(port, () => {
    console.log(`FrostSow Full-Stack Server running on port ${port}`);
  });
});
