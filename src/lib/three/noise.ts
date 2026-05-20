// Seeded 3D Perlin noise + fractional Brownian motion
// Based on Ken Perlin's reference implementation

export function makePermutation(seed: number): Uint8Array {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  const lcg = (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };

  const arr = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = arr[i & 255];
  return perm;
}

export function makeRng(seed: number): () => number {
  let s = (seed ^ 0x12345678) >>> 0;
  return (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function grad3(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export function noise3(
  perm: Uint8Array,
  x: number,
  y: number,
  z: number
): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;

  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);

  const u = fade(x), v = fade(y), w = fade(z);

  const A  = perm[X]     + Y;
  const AA = perm[A]     + Z;
  const AB = perm[A + 1] + Z;
  const B  = perm[X + 1] + Y;
  const BA = perm[B]     + Z;
  const BB = perm[B + 1] + Z;

  return lerp(
    lerp(
      lerp(grad3(perm[AA],     x,     y,     z    ), grad3(perm[BA],     x - 1, y,     z    ), u),
      lerp(grad3(perm[AB],     x,     y - 1, z    ), grad3(perm[BB],     x - 1, y - 1, z    ), u),
      v
    ),
    lerp(
      lerp(grad3(perm[AA + 1], x,     y,     z - 1), grad3(perm[BA + 1], x - 1, y,     z - 1), u),
      lerp(grad3(perm[AB + 1], x,     y - 1, z - 1), grad3(perm[BB + 1], x - 1, y - 1, z - 1), u),
      v
    ),
    w
  );
}

export function fbm(
  perm: Uint8Array,
  x: number,
  y: number,
  z: number,
  octaves: number
): number {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += noise3(perm, x * freq, y * freq, z * freq) * amp;
    amp  *= 0.5;
    freq *= 2.0;
  }
  return val;
}
