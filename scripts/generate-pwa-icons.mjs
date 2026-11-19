import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const publicDir = path.resolve(process.cwd(), 'public');
fs.mkdirSync(publicDir, { recursive: true });

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter none
    rgbaBuffer.copy(raw, rowStart + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function renderIcon(size, maskable = false) {
  const buf = Buffer.alloc(size * size * 4);
  const scale = maskable ? 0.72 : 0.88;
  const cx = size / 2;
  const cy = size / 2;
  const half = (size * scale) / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Background gradient: deep navy #0B192C to #0F2544
      const t = (x + y) / (2 * size);
      let r = Math.round(11 + t * 5);
      let g = Math.round(25 + t * 14);
      let b = Math.round(44 + t * 24);
      let a = 255;

      // Normalized coords inside emblem [-1, 1]
      const nx = (x - cx) / half;
      const ny = (y - cy) / half;

      // Shield outer boundary
      const inShieldTop = ny >= -0.78 && ny <= 0.05 && Math.abs(nx) <= 0.64;
      const shieldBottomLimit = 0.64 * (1 - Math.max(0, (ny - 0.05) / 0.8));
      const inShieldBottom = ny > 0.05 && ny <= 0.85 && Math.abs(nx) <= shieldBottomLimit;

      // Checkmark segments
      const d1 = distToSegment(nx, ny, -0.28, 0.02, -0.06, 0.25);
      const d2 = distToSegment(nx, ny, -0.06, 0.25, 0.34, -0.24);
      const checkDist = Math.min(d1, d2);

      // Border ring of shield
      const onShieldEdge =
        (inShieldTop && (Math.abs(Math.abs(nx) - 0.64) < 0.08 || Math.abs(ny + 0.78) < 0.08)) ||
        (inShieldBottom && Math.abs(Math.abs(nx) - shieldBottomLimit) < 0.09);

      if (inShieldTop || inShieldBottom) {
        r = 16;
        g = 38;
        b = 68;
      }
      if (onShieldEdge) {
        r = 56;
        g = 189;
        b = 248;
      }
      if (checkDist < 0.085) {
        r = 125;
        g = 211;
        b = 252;
      }

      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }

  return encodePNG(size, size, buf);
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), renderIcon(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), renderIcon(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), renderIcon(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), renderIcon(180, false));

console.log('Generated PWA PNG icons in public/');
