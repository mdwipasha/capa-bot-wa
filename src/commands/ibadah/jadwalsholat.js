import { prayerSchedule } from '../../services/searchService.js';
import { sendReply } from '../../utils/command.js';

export default {
  name: 'jadwalsholat',
  alias: ['sholat', 'prayer'],
  category: 'ibadah',
  description: 'Jadwal sholat berdasarkan kota.',
  cooldownMs: 6000,
  async execute({ sock, msg, args }) {
    const city = args.join(' ') || 'Jakarta';
    const { place, timings } = await prayerSchedule(city);
    await sendReply(sock, msg, `Jadwal Sholat ${place.name}\nSubuh: ${timings.Fajr}\nDzuhur: ${timings.Dhuhr}\nAshar: ${timings.Asr}\nMaghrib: ${timings.Maghrib}\nIsya: ${timings.Isha}`);
  }
};
