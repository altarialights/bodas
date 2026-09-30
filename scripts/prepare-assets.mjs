import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Run only when authoring the project. Runtime assets are committed in public/.
const sources = {
  'elena-marcos': 'exec-ec252a8f-0e72-4b52-82af-1d18515e5ac7.png',
  manos: 'exec-7136e79e-4e40-49f8-b96a-25cfa7e77f29.png',
  'ines-gabriel': 'exec-abed86f4-b4f9-482d-bb6d-29de1000e8a8.png',
  mesa: 'exec-9cd21db9-233b-456d-810e-3cda359a0db2.png',
  baile: 'exec-f2d83cb0-4db3-4aea-aa8c-f585216f3944.png',
  'manos-mar': 'exec-d20dbb5f-e743-44b0-a972-4ccf206c4e96.png',
};
const input = process.argv[2];
if (!input) throw new Error('Pass the directory containing the generated source photographs.');
await fs.mkdir('public/images', { recursive: true });
for (const [name, file] of Object.entries(sources)) {
  for (const width of [480, 960, 1536]) {
    await sharp(path.join(input, file)).resize({ width, withoutEnlargement: true }).webp({ quality: 83 }).toFile(`public/images/${name}-${width}.webp`);
  }
}

// An original 32-second instrumental miniature, mathematically synthesized here.
// No samples, recordings, existing song melody, external licenses or services.
const sampleRate = 22050;
const duration = 32;
const pcm = new Float32Array(sampleRate * duration);
const midiToHz = note => 440 * Math.pow(2, (note - 69) / 12);
function note(midi, start, length, volume) {
  const hz = midiToHz(midi);
  const offset = Math.round(start * sampleRate);
  const count = Math.min(Math.round(length * sampleRate), pcm.length - offset);
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, t / .018) * Math.exp(-t * 1.35) * Math.min(1, (length - t) / .4);
    const fundamental = Math.sin(2 * Math.PI * hz * t);
    const overtones = .22 * Math.sin(2 * Math.PI * hz * 2 * t) + .055 * Math.sin(2 * Math.PI * hz * 3 * t);
    pcm[offset + i] += (fundamental + overtones) * volume * envelope;
  }
}
const chords = [[48, 55, 60, 64, 67], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62]];
for (let bar = 0; bar < 8; bar++) {
  const chord = chords[bar % 4];
  note(chord[0], bar * 4, 3.9, .105);
  const pattern = [1, 2, 3, 4, 2, 3, 1, 3];
  pattern.forEach((n, beat) => note(chord[n] + (bar > 3 ? 12 : 0), bar * 4 + beat * .5, 2.6, .06));
}
const buffer = Buffer.alloc(44 + pcm.length * 2);
buffer.write('RIFF'); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVE', 8); buffer.write('fmt ', 12); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write('data', 36); buffer.writeUInt32LE(pcm.length * 2, 40);
for (let i = 0; i < pcm.length; i++) { const fade = Math.min(1, i / sampleRate / 1.2, (pcm.length - i) / sampleRate / 2); buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, pcm[i] * fade)) * 32767), 44 + i * 2); }
await fs.mkdir('public/audio', { recursive: true });
await fs.writeFile('public/audio/entre-olivos.wav', buffer);
console.log(`${Object.keys(sources).length * 3} responsive WebP photographs and original instrumental prepared.`);
