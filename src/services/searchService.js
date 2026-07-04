import axios from 'axios';

// Local backup anime quotes in case APIs are down/404
const backupQuotes = [
  { quote: "If you don't like your destiny, don't accept it. Instead, have the courage to change it the way you want it to be.", character: "Naruto Uzumaki", anime: "Naruto" },
  { quote: "Seseorang yang kuat tidak perlu melihat ke depan maupun ke belakang.", character: "Roronoa Zoro", anime: "One Piece" },
  { quote: "Thinking you're no good and worthless is the worst thing you can do.", character: "Nobita Nobi", anime: "Doraemon" },
  { quote: "Jika kau ingin membuat orang lain bahagia, kau harus bahagia terlebih dahulu.", character: "Kousei Arima", anime: "Shigatsu wa Kimi no Uso" },
  { quote: "Pikiran kosong adalah awal dari segala kekalahan.", character: "Lelouch vi Britannia", anime: "Code Geass" },
  { quote: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", character: "Kenshin Himura", anime: "Rurouni Kenshin" },
  { quote: "Fear is not evil. It tells you what your weakness is.", character: "Gildarts Clive", anime: "Fairy Tail" },
  { quote: "If you can't find a reason to fight, then you shouldn't be fighting.", character: "Akame", anime: "Akame ga Kill" }
];

export const wikipedia = async (query) => {
  const url = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  const { data } = await axios.get(url, { timeout: 15000 });
  return {
    title: data.title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page
  };
};

export const weather = async (city) => {
  const geo = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: { name: city, count: 1, language: 'id', format: 'json' },
    timeout: 15000
  });
  const place = geo.data.results?.[0];
  if (!place) throw new Error('Lokasi tidak ditemukan.');
  const meteo = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: { latitude: place.latitude, longitude: place.longitude, current: 'temperature_2m,relative_humidity_2m,wind_speed_10m' },
    timeout: 15000
  });
  return { place, current: meteo.data.current };
};

export const animeSearch = async (query) => {
  const { data } = await axios.get('https://api.jikan.moe/v4/anime', {
    params: { q: query, limit: 3 },
    timeout: 15000
  });
  return data.data || [];
};

export const characterSearch = async (query) => {
  const { data } = await axios.get('https://api.jikan.moe/v4/characters', {
    params: { q: query, limit: 3 },
    timeout: 15000
  });
  return data.data || [];
};

export const mangaSearch = async (query) => {
  const { data } = await axios.get('https://api.jikan.moe/v4/manga', {
    params: { q: query, limit: 3 },
    timeout: 15000
  });
  return data.data || [];
};

export const animeQuote = async () => {
  try {
    // some-random-api is more stable than animechan.io
    const { data } = await axios.get('https://some-random-api.com/animu/quote', { timeout: 8000 });
    if (data && data.sentence) {
      return {
        quote: data.sentence,
        character: data.character,
        anime: data.anime
      };
    }
  } catch (err) {
    // Fallback: try animechan.xyz
    try {
      const { data } = await axios.get('https://animechan.xyz/api/random', { timeout: 8000 });
      if (data && data.quote) {
        return {
          quote: data.quote,
          character: data.character,
          anime: data.anime
        };
      }
    } catch (e) {
      // If all APIs fail, return a random backup quote
      const idx = Math.floor(Math.random() * backupQuotes.length);
      return backupQuotes[idx];
    }
  }
  // Ultimate fallback
  const idx = Math.floor(Math.random() * backupQuotes.length);
  return backupQuotes[idx];
};

export const movieSearch = async (query) => {
  const { data } = await axios.get('https://www.omdbapi.com/', {
    params: { apikey: 'trilogy', s: query },
    timeout: 15000
  });
  if (data.Response === 'False') throw new Error(data.Error || 'Film tidak ditemukan.');
  return data.Search || [];
};

export const currencyRate = async (from, to) => {
  const { data } = await axios.get(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`, { timeout: 15000 });
  const rate = data.rates?.[to.toUpperCase()];
  if (!rate) throw new Error('Kode mata uang tidak valid.');
  return rate;
};

export const googleLikeSearch = async (query) => {
  try {
    const { data } = await axios.get('https://api.duckduckgo.com/', {
      params: { q: query, format: 'json', no_html: 1, skip_disambig: 1 },
      timeout: 8000
    });
    const related = data.RelatedTopics?.flatMap((item) => item.Topics || [item]).filter((item) => item.Text).slice(0, 5) || [];
    if (data.AbstractText || related.length) {
      return {
        heading: data.Heading || query,
        abstract: data.AbstractText,
        url: data.AbstractURL,
        related
      };
    }
  } catch {
    // Fallback below keeps the command useful when DuckDuckGo is slow or blocked.
  }

  let titles = [];
  let descriptions = [];
  let links = [];
  try {
    const { data } = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'opensearch',
        search: query,
        limit: 5,
        namespace: 0,
        format: 'json'
      },
      headers: { 'user-agent': 'ModernWhatsAppBot/1.0 (local bot search command)' },
      timeout: 12000
    });
    titles = data[1] || [];
    descriptions = data[2] || [];
    links = data[3] || [];
  } catch {
    titles = ['DuckDuckGo Search', 'Google Search'];
    descriptions = ['Buka hasil pencarian DuckDuckGo.', 'Buka hasil pencarian Google.'];
    links = [
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      `https://www.google.com/search?q=${encodeURIComponent(query)}`
    ];
  }
  if (!titles.length) {
    titles = ['DuckDuckGo Search', 'Google Search'];
    descriptions = ['Buka hasil pencarian DuckDuckGo.', 'Buka hasil pencarian Google.'];
    links = [
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      `https://www.google.com/search?q=${encodeURIComponent(query)}`
    ];
  }
  return {
    heading: `Search: ${query}`,
    abstract: 'Hasil ringkas dari fallback search.',
    url: '',
    related: titles.map((title, index) => ({
      Text: `${title} - ${descriptions[index] || 'No description'}`,
      FirstURL: links[index] || ''
    }))
  };
};

export const lyrics = async (artist, title) => {
  const { data } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, { timeout: 15000 });
  if (!data.lyrics) throw new Error('Lyrics tidak ditemukan.');
  return data.lyrics;
};

export const recipe = async (query) => {
  const { data } = await axios.get('https://www.themealdb.com/api/json/v1/1/search.php', {
    params: { s: query },
    timeout: 15000
  });
  return data.meals?.[0];
};

export const translateText = async (text, target = 'id') => {
  const { data } = await axios.get('https://api.mymemory.translated.net/get', {
    params: { q: text, langpair: `auto|${target}` },
    timeout: 15000
  });
  return data.responseData?.translatedText || 'Terjemahan tidak tersedia.';
};

export const prayerSchedule = async (city = 'Jakarta') => {
  const geo = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: { name: city, count: 1, language: 'id', format: 'json' },
    timeout: 15000
  });
  const place = geo.data.results?.[0];
  if (!place) throw new Error('Lokasi tidak ditemukan.');
  const { data } = await axios.get('https://api.aladhan.com/v1/timings', {
    params: { latitude: place.latitude, longitude: place.longitude, method: 20 },
    timeout: 15000
  });
  return { place, timings: data.data.timings };
};
