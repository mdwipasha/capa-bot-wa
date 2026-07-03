import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import YTDlpWrapModule from 'yt-dlp-wrap';
import { downloaderApis } from '../config/apis.js';

const YTDlpWrap = YTDlpWrapModule.default || YTDlpWrapModule;
const binaryPath = path.resolve('bin', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
const downloadsDir = path.resolve('downloads');
let ytDlp;

const ensureYtDlp = async () => {
  if (!await fs.pathExists(binaryPath)) {
    await fs.ensureDir(path.dirname(binaryPath));
    const assetName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
    const directUrl = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${assetName}`;
    const response = await axios.get(directUrl, {
      responseType: 'stream',
      headers: { 'user-agent': 'modern-whatsapp-bot' },
      timeout: 120000
    });
    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(binaryPath);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    if (process.platform !== 'win32') await fs.chmod(binaryPath, 0o755);
  }
  ytDlp ??= new YTDlpWrap(binaryPath);
  return ytDlp;
};

const newestFile = async (dir) => {
  const files = await fs.readdir(dir);
  const stats = await Promise.all(files.map(async (file) => {
    const fullPath = path.join(dir, file);
    return { fullPath, stat: await fs.stat(fullPath) };
  }));
  return stats.filter((item) => item.stat.isFile()).sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)[0]?.fullPath;
};

export const tiktok = async (url) => {
  const { data } = await axios.post(downloaderApis.tikwm, new URLSearchParams({ url, hd: '1' }), {
    headers: { 'content-type': 'application/x-www-form-urlencoded' }
  });
  if (!data?.data) throw new Error('TikTok gagal diproses.');
  return { title: data.data.title || 'TikTok', url: data.data.hdplay || data.data.play };
};

export const ytDlpDownload = async (url, mode = 'video') => {
  const runner = await ensureYtDlp();
  await fs.ensureDir(downloadsDir);
  const jobDir = path.join(downloadsDir, `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fs.ensureDir(jobDir);

  const isAudio = mode === 'audio';
  const output = path.join(jobDir, '%(title).80s.%(ext)s');
  const format = isAudio
    ? 'ba[ext=m4a]/ba[ext=mp3]/ba/bestaudio'
    : 'b[ext=mp4]/bv*[ext=mp4]+ba[ext=m4a]/best';

  const args = [
    url,
    '--no-playlist',
    '--restrict-filenames',
    '--no-warnings',
    '-f',
    format,
    '-o',
    output
  ];

  if (!isAudio) args.push('--merge-output-format', 'mp4');

  try {
    await runner.execPromise(args, { maxBuffer: 1024 * 1024 * 20 });
    const filePath = await newestFile(jobDir);
    if (!filePath) throw new Error('File hasil download tidak ditemukan.');
    const ext = path.extname(filePath).slice(1).toLowerCase();
    return {
      filePath,
      cleanupDir: jobDir,
      title: path.basename(filePath),
      ext,
      mime: isAudio ? (ext === 'mp3' ? 'audio/mpeg' : 'audio/mp4') : 'video/mp4'
    };
  } catch (error) {
    await fs.remove(jobDir).catch(() => {});
    throw new Error(`yt-dlp gagal: ${error.message}`);
  }
};

export const cobalt = async (url, downloadMode = 'auto') => {
  const baseUrl = downloaderApis.cobalt.endsWith('/') ? downloaderApis.cobalt : `${downloaderApis.cobalt}/`;
  const endpoint = new URL('./', baseUrl).href;
  const headers = { accept: 'application/json', 'content-type': 'application/json' };
  if (downloaderApis.cobaltApiKey) headers.authorization = `Api-Key ${downloaderApis.cobaltApiKey}`;

  const payload = {
    url,
    downloadMode,
    audioFormat: 'mp3',
    audioBitrate: '128',
    videoQuality: '1080',
    filenameStyle: 'basic'
  };

  const { data } = await axios.post(endpoint, payload, { headers, timeout: 30000 }).catch((error) => {
    const body = error.response?.data;
    const code = body?.error?.code || body?.code || body?.text || error.message;
    if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
      throw new Error(`Cobalt gagal: ${code}. Jika memakai api.cobalt.tools, gunakan instance sendiri atau isi COBALT_API_URL/COBALT_API_KEY.`);
    }
    throw error;
  });
  if (data.status === 'redirect' || data.status === 'tunnel') return { title: data.filename || 'download', url: data.url };
  if (data.status === 'picker' && data.picker?.[0]?.url) return { title: 'download', url: data.picker[0].url };
  if (data.status === 'local-processing' && data.tunnel?.[0]) return { title: data.output?.filename || 'download', url: data.tunnel[0] };
  throw new Error(data.error?.code || data.text || 'Downloader gagal memproses URL.');
};
