import axios from 'axios';
import { aiApis } from '../config/apis.js';

const geminiRetry = async (fn, retries = 1) => {
  try {
    return await fn();
  } catch (error) {
    const status = error.response?.status;
    if (status === 429 && retries > 0) {
      await new Promise((r) => setTimeout(r, 3000));
      return geminiRetry(fn, retries - 1);
    }
    if (status === 429) throw new Error('Gemini sedang rate limit (terlalu banyak request). Coba lagi dalam beberapa detik.');
    if (status === 400) throw new Error('Request tidak valid: ' + (error.response?.data?.error?.message || 'format salah.'));
    if (status === 403) throw new Error('API key tidak punya akses ke model ini.');
    if (status === 404) throw new Error('Model Gemini tidak ditemukan. Coba hubungi admin.');
    throw error;
  }
};

export const askChatGPT = async (prompt) => {
  const api = aiApis.chatgpt;
  if (!api.apiKey) throw new Error('OPENAI_API_KEY belum diisi di .env');
  try {
    const { data } = await axios.post(api.baseUrl, {
      model: api.model,
      messages: [{ role: 'user', content: prompt }]
    }, { headers: { Authorization: `Bearer ${api.apiKey}` } });
    return data.choices?.[0]?.message?.content || 'Tidak ada jawaban.';
  } catch (error) {
    const status = error.response?.status;
    if (status === 429) throw new Error('OpenAI sedang rate limit. Coba lagi nanti.');
    if (status === 401) throw new Error('OPENAI_API_KEY tidak valid.');
    throw error;
  }
};

export const askGemini = async (prompt) => {
  const api = aiApis.gemini;
  if (!api.apiKey) throw new Error('GEMINI_API_KEY belum diisi di .env');
  const result = await geminiRetry(async () => {
    const { data } = await axios.post(`${api.baseUrl}?key=${api.apiKey}`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024 }
    });
    return data;
  });
  return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada jawaban.';
};

export const askClaude = async (prompt) => {
  const api = aiApis.claude;
  if (!api.apiKey) throw new Error('CLAUDE_API_KEY belum diisi di .env');
  try {
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
  } catch (error) {
    const status = error.response?.status;
    if (status === 429) throw new Error('Claude sedang rate limit. Coba lagi nanti.');
    if (status === 401) throw new Error('CLAUDE_API_KEY tidak valid.');
    throw error;
  }
};
