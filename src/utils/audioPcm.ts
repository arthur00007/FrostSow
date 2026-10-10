// Utility functions for PCM 16kHz audio capture & 24kHz Live API playback

export function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  for (let i = 0; i < input.length; i++) {
    let s = Math.max(-1, Math.min(1, input[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7fff;
    output.setInt16(i * 2, s, true); // little-endian
  }
  return output.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convert 24kHz raw PCM little-endian buffer into AudioBuffer
export function createAudioBufferFromPCM(
  pcmBuffer: ArrayBuffer,
  ctx: AudioContext,
  sampleRate = 24000
): AudioBuffer {
  const dataView = new DataView(pcmBuffer);
  const sampleCount = pcmBuffer.byteLength / 2;
  const audioBuffer = ctx.createBuffer(1, sampleCount, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < sampleCount; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    channelData[i] = int16 / (int16 < 0 ? 32768 : 32767);
  }

  return audioBuffer;
}
