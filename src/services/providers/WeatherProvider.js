import axios from 'axios';

export class WeatherProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }
  async forecast(city, options = {}) {
    throw new Error('Method forecast() must be implemented');
  }
}

export class OpenMeteoWeatherProvider extends WeatherProvider {
  async forecast(city) {
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
  }
}
