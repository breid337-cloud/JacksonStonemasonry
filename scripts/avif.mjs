// Makes AVIF copies of every photograph in src/assets/img (640, 800 and 960px plus full
// width) and lists them in src/_data/images.json, which the build's <picture> transform
// (.eleventy.js) reads. Outputs are committed, so Netlify never runs this.
//
// Run after adding or replacing a photo:  npm run images
// Forgetting is safe: each entry records a hash of its original, and the build serves the
// plain JPEG for any photo whose original no longer matches, so a replaced photo never
// shows its old AVIF.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const DIR = 'src/assets/img';
const MANIFEST = 'src/_data/images.json';
const QUALITY = 50; // textured stone photos barely shrink as WebP; AVIF roughly halves them
const STEPS = [640, 800, 960];

const previous = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
const files = fs.readdirSync(DIR).filter((f) => /\.(jpe?g|png)$/i.test(f) && !/-(640|800|960)\.\w+$/.test(f));
const manifest = {};
let made = 0;

for (const f of files) {
  const base = f.replace(/\.\w+$/, '');
  if (/^(favicon|video-poster)/.test(base)) continue;
  const src = path.join(DIR, f);
  const hash = crypto.createHash('sha1').update(fs.readFileSync(src)).digest('hex').slice(0, 12);
  const { width } = await sharp(src).metadata();
  const key = `/assets/img/${f}`;
  const fresh = previous[key]?.hash === hash;
  const widths = [];
  const out = async (w, name) => {
    const dest = path.join(DIR, name);
    if (!fresh || !fs.existsSync(dest)) {
      await sharp(src).resize({ width: w, withoutEnlargement: true }).avif({ quality: QUALITY, effort: 4 }).toFile(dest);
      made++;
    }
    widths.push(Math.min(w, width));
  };
  // A middle step is only worth a file when it is clearly smaller than the original.
  for (const w of STEPS) if (width > w * 1.15) await out(w, `${base}-${w}.avif`);
  await out(width, `${base}.avif`);
  manifest[key] = { base: `/assets/img/${base}`, widths, hash };
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
console.log(`${Object.keys(manifest).length} images, ${made} AVIF files written`);
