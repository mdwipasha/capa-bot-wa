import axios from 'axios';
import { aiApis } from '../config/apis.js';

export const askChatGPT = async (prompt) => {
  const api = aiApis.chatgpt;
  if (!api.apiKey) throw new Error('OPENAI_API_KEY belum diisi.');
  const { data } = await axios.post(api.baseUrl, {
    model: api.model,
    messages: [{ role: 'user', content: prompt }]
  }, { headers: { Authorization: `Bearer ${api.apiKey}` } });
  return data.choices?.[0]?.message?.content || 'Tidak ada jawaban.';
};

export const askGemini = async (prompt) => {
  const api = aiApis.gemini;
  if (!api.apiKey) throw new Error('GEMINI_API_KEY belum diisi.');
  const { data } = await axios.post(`${api.baseUrl}?key=${api.apiKey}`, {
    contents: [{ parts: [{ text: prompt }] }]
  });
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada jawaban.';
};

export const askClaude = async (prompt) => {
  const api = aiApis.claude;
  if (!api.apiKey) throw new Error('CLAUDE_API_KEY belum diisi.');
  const { data } = await axios.post(api.baseUrl, {
    model: api.model,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      'x-api-key': api.apiKey,
      'anthropic-version': '2023-06-01'
    }
  });
  return data.content?.[0]?.text || 'Tidak ada jawaban.';
};
