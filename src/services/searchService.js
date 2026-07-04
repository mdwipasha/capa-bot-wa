import { serviceManager } from './ServiceManager.js';

export const wikipedia = async (query) => {
  return await serviceManager.search.wikipedia(query);
};

export const weather = async (city) => {
  return await serviceManager.weather.forecast(city);
};

export const animeSearch = async (query) => {
  return await serviceManager.search.animeSearch(query);
};

export const characterSearch = async (query) => {
  return await serviceManager.search.characterSearch(query);
};

export const mangaSearch = async (query) => {
  return await serviceManager.search.mangaSearch(query);
};

export const animeQuote = async () => {
  return await serviceManager.search.animeQuote();
};

export const movieSearch = async (query) => {
  return await serviceManager.search.movieSearch(query);
};

export const currencyRate = async (from, to) => {
  return await serviceManager.search.currencyRate(from, to);
};

export const googleLikeSearch = async (query) => {
  return await serviceManager.search.googleLikeSearch(query);
};

export const lyrics = async (artist, title) => {
  return await serviceManager.search.lyrics(artist, title);
};

export const recipe = async (query) => {
  return await serviceManager.search.recipe(query);
};

export const translateText = async (text, target = 'id') => {
  return await serviceManager.translate.translate(text, target);
};

export const prayerSchedule = async (city = 'Jakarta') => {
  return await serviceManager.search.prayerSchedule(city);
};
