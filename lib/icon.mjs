import zlib from 'node:zlib';

const SIZE = 1024;

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createCanvas() {
  const pixels = Buffer.alloc(SIZE * SIZE * 3);
  return { pixels };
}

function blend(canvas, x, y, red, green, blue, alpha = 1) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  const offset = (y * SIZE + x) * 3;
  const a = clamp(alpha, 0, 1);
  canvas.pixels[offset] = Math.round(canvas.pixels[offset] * (1 - a) + red * a);
  canvas.pixels[offset + 1] = Math.round(canvas.pixels[offset + 1] * (1 - a) + green * a);
  canvas.pixels[offset + 2] = Math.round(canvas.pixels[offset + 2] * (1 - a) + blue * a);
}

function fillBackground(canvas) {
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const dx = (x - 280) / 760;
      const dy = (y - 160) / 760;
      const glow = clamp(1 - Math.sqrt(dx * dx + dy * dy), 0, 1);
      const edge = clamp((x + y) / (SIZE * 2), 0, 1);
      blend(
        canvas,
        x,
        y,
        8 + glow * 22 + edge * 3,
        17 + glow * 40 + edge * 6,
        15 + glow * 24 + edge * 3,
        1,
      );
    }
  }
}

function fillCircle(canvas, centerX, centerY, radius, color, alpha = 1) {
  const minX = Math.max(0, Math.floor(centerX - radius));
  const maxX = Math.min(SIZE - 1, Math.ceil(centerX + radius));
  const minY = Math.max(0, Math.floor(centerY - radius));
  const maxY = Math.min(SIZE - 1, Math.ceil(centerY + radius));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x + 0.5 - centerX;
      const dy = y + 0.5 - centerY;
      if (dx * dx + dy * dy <= radius * radius) {
        blend(canvas, x, y, color[0], color[1], color[2], alpha);
      }
    }
  }
}

function roundedRectContains(x, y, left, top, right, bottom, radius) {
  if (x < left || x > right || y < top || y > bottom) return false;
  const nearestX = clamp(x, left + radius, right - radius);
  const nearestY = clamp(y, top + radius, bottom - radius);
  const dx = x - nearestX;
  const dy = y - nearestY;
  return dx * dx + dy * dy <= radius * radius;
}

function strokeRoundedRect(canvas, left, top, right, bottom, radius, width, color, alpha = 1) {
  for (let y = Math.floor(top - width); y <= Math.ceil(bottom + width); y += 1) {
    for (let x = Math.floor(left - width); x <= Math.ceil(right + width); x += 1) {
      const outer = roundedRectContains(x + 0.5, y + 0.5, left, top, right, bottom, radius);
      const inner = roundedRectContains(
        x + 0.5,
        y + 0.5,
        left + width,
        top + width,
        right - width,
        bottom - width,
        Math.max(0, radius - width),
      );
      if (outer && !inner) blend(canvas, x, y, color[0], color[1], color[2], alpha);
    }
  }
}

function strokeLine(canvas, x1, y1, x2, y2, width, color, alpha = 1) {
  const minX = Math.max(0, Math.floor(Math.min(x1, x2) - width));
  const maxX = Math.min(SIZE - 1, Math.ceil(Math.max(x1, x2) + width));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2) - width));
  const maxY = Math.min(SIZE - 1, Math.ceil(Math.max(y1, y2) + width));
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const t = lengthSquared === 0
        ? 0
        : clamp(((x + 0.5 - x1) * dx + (y + 0.5 - y1) * dy) / lengthSquared, 0, 1);
      const px = x1 + t * dx;
      const py = y1 + t * dy;
      const distance = (x + 0.5 - px) ** 2 + (y + 0.5 - py) ** 2;
      if (distance <= width * width) blend(canvas, x, y, color[0], color[1], color[2], alpha);
    }
  }
}

function encodePng(canvas) {
  const stride = SIZE * 3 + 1;
  const raw = Buffer.alloc(stride * SIZE);
  for (let y = 0; y < SIZE; y += 1) {
    raw[y * stride] = 0;
    canvas.pixels.copy(raw, y * stride + 1, y * SIZE * 3, (y + 1) * SIZE * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Deterministic scaffold icon: a real 1024x1024 RGB PNG, not a stock fake.
 * Products should replace it with designed brand media before publication.
 */
export function createScaffoldIcon() {
  const canvas = createCanvas();
  fillBackground(canvas);
  const lime = [184, 242, 107];
  const base = [8, 17, 15];
  strokeRoundedRect(canvas, 210, 210, 814, 814, 118, 22, lime, 0.72);
  fillCircle(canvas, 512, 512, 184, lime, 1);
  strokeLine(canvas, 402, 660, 660, 352, 58, base, 1);
  fillCircle(canvas, 712, 714, 34, lime, 0.96);
  fillCircle(canvas, 176, 176, 10, lime, 0.5);
  return encodePng(canvas);
}
