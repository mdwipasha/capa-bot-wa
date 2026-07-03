import { weather } from '../../services/searchService.js';
import { requireText, sendReply } from '../../utils/command.js';

export default {
  name: 'weather',
  alias: ['cuaca'],
  category: 'search',
  description: 'Cek cuaca kota.',
  cooldownMs: 5000,
  async execute({ sock, msg, args, prefix }) {
    const city = await requireText(sock, msg, args, `${prefix}cuaca Jakarta`);
    if (!city) return;
    const { place, current } = await weather(city);
    await sendReply(sock, msg, `Cuaca ${place.name}\nSuhu: ${current.temperature_2m} C\nHumidity: ${current.relative_humidity_2m}%\nAngin: ${current.wind_speed_10m} km/h`);
  }
};
