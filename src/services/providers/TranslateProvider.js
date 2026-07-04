import axios from 'axios';

export class TranslateProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }
  async translate(text, target, options = {}) {
    throw new Error('Method translate() must be implemented');
  }
}

export class MyMemoryTranslateProvider extends TranslateProvider {
  async translate(text, target = 'id') {
    const { data } = await axios.get('https://api.mymemory.translated.net/get', {
      params: { q: text, langpair: `auto|${target}` },
      timeout: 15000
    });
    return data.responseData?.translatedText || 'Terjemahan tidak tersedia.';
  }
}
