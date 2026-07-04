import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { serviceManager } from './ServiceManager.js';

export const tempPath = async (ext = 'bin') => {
  await fs.ensureDir('tmp');
  return path.resolve('tmp', `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
};

export const runFfmpeg = (args) => new Promise((resolve, reject) => {
  const proc = spawn('ffmpeg', ['-y', ...args], { windowsHide: true });
  let stderr = '';
  proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  proc.on('error', () => reject(new Error('FFmpeg belum terinstall atau tidak ada di PATH.')));
  proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(stderr.split('\n').slice(-4).join('\n').trim() || 'FFmpeg gagal memproses media.')));
});

export const imageToPdf = async (buffer) => {
  return await serviceManager.image.toPdf(buffer);
};

export const imageEffect = async (buffer, effect) => {
  return await serviceManager.image.applyEffect(buffer, effect);
};

export const audioFilter = async (buffer, ext, filter) => {
  const input = await tempPath(ext);
  const output = await tempPath('mp3');
  await fs.writeFile(input, buffer);
  const filters = {
    bass: 'bass=g=12',
    nightcore: 'asetrate=44100*1.25,aresample=44100,atempo=1.05',
    slow: 'atempo=0.75',
    fast: 'atempo=1.35',
    robot: 'afftfilt=real=hypot(re\\,im)*sin(0):imag=hypot(re\\,im)*cos(0)',
    echo: 'aecho=0.8:0.9:1000:0.3',
    reverse: 'areverse',
    volume: 'volume=2.0'
  };
  await runFfmpeg(['-i', input, '-af', filters[filter], output]);
  const result = await fs.readFile(output);
  await fs.remove(input).catch(() => {});
  await fs.remove(output).catch(() => {});
  return result;
};

export const videoFilter = async (buffer, ext, mode) => {
  const input = await tempPath(ext);
  const outputExt = mode === 'gif' ? 'gif' : mode === 'audio' ? 'mp3' : 'mp4';
  const output = await tempPath(outputExt);
  await fs.writeFile(input, buffer);
  const argsByMode = {
    gif: ['-i', input, '-vf', 'fps=12,scale=480:-1:flags=lanczos', output],
    audio: ['-i', input, '-vn', '-codec:a', 'libmp3lame', output],
    reverse: ['-i', input, '-vf', 'reverse', '-af', 'areverse', output],
    fast: ['-i', input, '-vf', 'setpts=0.7*PTS', '-af', 'atempo=1.35', output],
    slow: ['-i', input, '-vf', 'setpts=1.5*PTS', '-af', 'atempo=0.75', output]
  };
  await runFfmpeg(argsByMode[mode]);
  const result = await fs.readFile(output);
  await fs.remove(input).catch(() => {});
  await fs.remove(output).catch(() => {});
  return { buffer: result, ext: outputExt };
};
