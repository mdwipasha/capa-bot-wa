import axios from 'axios';
import pkg from 'btch-downloader';
const { youtube, tiktok, igdl, fbdown, spotify, twitter, threads } = pkg;

export class DownloaderProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }
  async download(url, type, options = {}) {
    throw new Error('Method download() must be implemented');
  }
}

export class BtchDownloaderProvider extends DownloaderProvider {
  async download(url, type) {
    switch (type.toLowerCase()) {
      case 'youtube':
      case 'ytmp4':
      case 'ytmp3': {
        const res = await youtube(url);
        return {
          title: res.title || 'YouTube Video',
          mp4: res.mp4,
          mp3: res.mp3,
          thumbnail: res.thumb
        };
      }
      case 'tiktok': {
        const res = await tiktok(url);
        return {
          title: res.title || 'TikTok Video',
          mp4: res.video || res.nowm || res.wm,
          audio: res.audio
        };
      }
      case 'instagram':
      case 'ig': {
        const res = await igdl(url);
        return {
          media: Array.isArray(res) ? res : [res.url || res]
        };
      }
      case 'facebook':
      case 'fb': {
        const res = await fbdown(url);
        return {
          title: res.title || 'Facebook Video',
          hd: res.hd,
          sd: res.sd || res.url
        };
      }
      case 'spotify': {
        const res = await spotify(url);
        return {
          title: res.title || 'Spotify Song',
          artist: res.artist,
          mp3: res.download || res.url
        };
      }
      case 'twitter':
      case 'x': {
        const res = await twitter(url);
        return {
          title: 'Twitter Media',
          media: res.url || res
        };
      }
      case 'threads': {
        const res = await threads(url);
        return {
          title: 'Threads Media',
          media: res.url || res
        };
      }
      default:
        throw new Error(`BtchDownloader does not support type: ${type}`);
    }
  }
}

export class CobaltDownloaderProvider extends DownloaderProvider {
  async download(url, type) {
    const cobaltUrl = this.config.apiUrl || 'https://api.cobalt.tools/';
    const apiKey = this.config.apiKey || '';

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Api-Key ${apiKey}`;
    }

    const { data } = await axios.post(cobaltUrl, {
      url,
      videoQuality: '720',
      audioFormat: 'mp3',
      filenameStyle: 'classic'
    }, { headers, timeout: 20000 });

    if (data.status === 'error') {
      throw new Error(data.text || 'Cobalt download failed.');
    }

    return {
      title: 'Cobalt Download',
      url: data.url,
      status: data.status,
      picker: data.picker || []
    };
  }
}

export class TikWmDownloaderProvider extends DownloaderProvider {
  async download(url, type) {
    if (type.toLowerCase() !== 'tiktok') {
      throw new Error('TikWm only supports TikTok downloads');
    }
    const apiUrl = this.config.apiUrl || 'https://www.tikwm.com/api/';
    const { data } = await axios.get(apiUrl, {
      params: { url },
      timeout: 15000
    });

    if (data.code !== 0 || !data.data) {
      throw new Error(data.msg || 'TikWm download failed.');
    }

    return {
      title: data.data.title || 'TikTok Video',
      mp4: data.data.play,
      wm: data.data.wmplay,
      audio: data.data.music,
      views: data.data.play_count
    };
  }
}
