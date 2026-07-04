import axios from 'axios';

export class SpeechProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }
  async textToSpeech(text, lang = 'id', options = {}) {
    throw new Error('Method textToSpeech() must be implemented');
  }
}

export class GoogleSpeechProvider extends SpeechProvider {
  async textToSpeech(text, lang = 'id') {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text.slice(0, 180))}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000
    });
    return Buffer.from(response.data);
  }
}
