// The VoroLens pipeline, ported from the lab app (math-code-art/voronoi-app, src/lib/voronoi):
//   image -> density field -> weighted seeds -> nearest-seed partition -> Lloyd -> mean colours
// Pure functions on typed arrays, no DOM, so the component owns every canvas.

const srgbToLinear = (u) => {
  u /= 255
  return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4)
}

// Rec. 709 luminance in linear light, and its Sobel gradient magnitude normalised to [0, 1].
export function computeField(rgba, W, H) {
  const npx = W * H
  const lum = new Float32Array(npx)
  for (let i = 0; i < npx; i++) {
    lum[i] =
      0.2126 * srgbToLinear(rgba[i * 4]) +
      0.7152 * srgbToLinear(rgba[i * 4 + 1]) +
      0.0722 * srgbToLinear(rgba[i * 4 + 2])
  }
  const edge = new Float32Array(npx)
  let emax = 1e-8
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x
      const gx = -lum[i - W - 1] - 2 * lum[i - 1] - lum[i + W - 1] + lum[i - W + 1] + 2 * lum[i + 1] + lum[i + W + 1]
      const gy = -lum[i - W - 1] - 2 * lum[i - W] - lum[i - W + 1] + lum[i + W - 1] + 2 * lum[i + W] + lum[i + W + 1]
      const m = Math.hypot(gx, gy)
      edge[i] = m
      if (m > emax) emax = m
    }
  }
  for (let i = 0; i < npx; i++) edge[i] /= emax
  return { lum, edge }
}

// d = w_b (1 - L) + w_e E, zero outside the mask, as a normalised CDF for inverse-transform
// sampling. Weights are the lab app's defaults (0.6 / 0.4).
export function densityCdf({ lum, edge }, mask, wb = 0.6, we = 0.4) {
  const npx = lum.length
  const cdf = new Float32Array(npx)
  let sum = 0
  for (let i = 0; i < npx; i++) {
    let d = 0
    if (!mask || mask[i]) d = Math.max(1e-6, wb * (1 - lum[i]) + we * edge[i])
    sum += d
    cdf[i] = sum
  }
  for (let i = 0; i < npx; i++) cdf[i] /= sum || 1
  return cdf
}

// Small seeded PRNG so moving the slider reshuffles the seeds predictably, not randomly.
export function mulberry32(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Draw N pixels with probability proportional to density (binary search in the CDF),
// jittered uniformly inside each pixel.
export function sampleSeeds(cdf, W, N, rand) {
  const x = new Float32Array(N)
  const y = new Float32Array(N)
  for (let k = 0; k < N; k++) {
    const r = rand()
    let lo = 0
    let hi = cdf.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (cdf[mid] < r) lo = mid + 1
      else hi = mid
    }
    x[k] = (lo % W) + rand()
    y[k] = ((lo / W) | 0) + rand()
  }
  return { x, y }
}

// Uniform bucket grid over the first n seeds (about one seed per bucket) for nearest-seed queries.
export function buildGrid(seedX, seedY, n, W, H) {
  const cell = Math.max(2, Math.round(Math.sqrt((W * H) / Math.max(1, n))))
  const gw = Math.ceil(W / cell)
  const gh = Math.ceil(H / cell)
  const heads = new Int32Array(gw * gh).fill(-1)
  const next = new Int32Array(n).fill(-1)
  for (let k = 0; k < n; k++) {
    const gx = Math.min(gw - 1, Math.max(0, (seedX[k] / cell) | 0))
    const gy = Math.min(gh - 1, Math.max(0, (seedY[k] / cell) | 0))
    const b = gy * gw + gx
    next[k] = heads[b]
    heads[b] = k
  }
  return { cell, gw, gh, heads, next, seedX, seedY, n }
}

// Search rings of buckets outward until the ring is farther than the best distance so far.
export function nearestSeed(grid, x, y) {
  const { cell, gw, gh, heads, next, seedX, seedY } = grid
  const gx = Math.min(gw - 1, Math.max(0, (x / cell) | 0))
  const gy = Math.min(gh - 1, Math.max(0, (y / cell) | 0))
  let best = -1
  let bestD = Infinity
  for (let r = 0; ; r++) {
    const x0 = Math.max(0, gx - r), x1 = Math.min(gw - 1, gx + r)
    const y0 = Math.max(0, gy - r), y1 = Math.min(gh - 1, gy + r)
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        if (Math.max(Math.abs(cx - gx), Math.abs(cy - gy)) !== r) continue
        for (let k = heads[cy * gw + cx]; k !== -1; k = next[k]) {
          const dx = seedX[k] - x, dy = seedY[k] - y
          const d = dx * dx + dy * dy
          if (d < bestD) { bestD = d; best = k }
        }
      }
    }
    if (best !== -1 && r * cell * (r * cell) > bestD) break
    if (x0 === 0 && y0 === 0 && x1 === gw - 1 && y1 === gh - 1) break
  }
  return best
}

// Label every (masked) working pixel with its nearest seed; accumulate centroid and colour
// sums per cell in the same pass.
export function assign(grid, rgba, W, H, mask) {
  const n = grid.n
  const sx = new Float64Array(n), sy = new Float64Array(n)
  const sr = new Float64Array(n), sg = new Float64Array(n), sb = new Float64Array(n)
  const cnt = new Int32Array(n)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      if (mask && !mask[i]) continue
      const k = nearestSeed(grid, x + 0.5, y + 0.5)
      sx[k] += x + 0.5; sy[k] += y + 0.5; cnt[k]++
      sr[k] += rgba[i * 4]; sg[k] += rgba[i * 4 + 1]; sb[k] += rgba[i * 4 + 2]
    }
  }
  return { sx, sy, sr, sg, sb, cnt }
}

// Nearest in-mask pixel centre by square-ring search (centroids of non-convex masked cells
// can land outside the object).
function nearestInside(mask, W, H, px, py, maxR = 90) {
  const x = Math.min(W - 1, Math.max(0, px | 0)), y = Math.min(H - 1, Math.max(0, py | 0))
  if (mask[y * W + x]) return null
  for (let r = 1; r < maxR; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue
        const nx = x + dx, ny = y + dy
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
        if (mask[ny * W + nx]) return [nx + 0.5, ny + 0.5]
      }
    }
  }
  return null
}

// One Lloyd step in place: every seed moves to its cell's (masked) centroid.
export function lloydStep(seeds, acc, W, H, mask) {
  const { x, y } = seeds
  for (let k = 0; k < acc.cnt.length; k++) {
    if (!acc.cnt[k]) continue
    x[k] = acc.sx[k] / acc.cnt[k]
    y[k] = acc.sy[k] / acc.cnt[k]
    if (mask) {
      const p = nearestInside(mask, W, H, x[k], y[k])
      if (p) { x[k] = p[0]; y[k] = p[1] }
    }
  }
}

// Each cell's mean colour; an empty cell falls back to the pixel under its seed.
export function meanColors(acc, seeds, rgba, W, H) {
  const n = acc.cnt.length
  const out = new Uint8ClampedArray(n * 3)
  for (let k = 0; k < n; k++) {
    const c = acc.cnt[k]
    if (c) {
      out[k * 3] = acc.sr[k] / c; out[k * 3 + 1] = acc.sg[k] / c; out[k * 3 + 2] = acc.sb[k] / c
    } else {
      const i = (Math.min(H - 1, seeds.y[k] | 0) * W + Math.min(W - 1, seeds.x[k] | 0)) * 4
      out[k * 3] = rgba[i]; out[k * 3 + 1] = rgba[i + 1]; out[k * 3 + 2] = rgba[i + 2]
    }
  }
  return out
}

// Paint into `out` (ImageData of any size): each pixel takes its nearest seed's colour.
// Pixels outside `outMask` (same size as `out`) stay transparent so the photo shows through.
export function renderMosaic(grid, colors, W, H, out, outMask) {
  const MW = out.width, MH = out.height, d = out.data
  const sx = W / MW, sy = H / MH
  for (let Y = 0; Y < MH; Y++) {
    for (let X = 0; X < MW; X++) {
      const p = Y * MW + X, o = p * 4
      if (outMask && !outMask[p]) { d[o + 3] = 0; continue }
      const c = nearestSeed(grid, (X + 0.5) * sx, (Y + 0.5) * sy) * 3
      d[o] = colors[c]; d[o + 1] = colors[c + 1]; d[o + 2] = colors[c + 2]; d[o + 3] = 255
    }
  }
  return out
}

// Nearest-neighbour resample of a binary mask.
export function resampleMask(src, sw, sh, dw, dh) {
  const out = new Uint8Array(dw * dh)
  for (let y = 0; y < dh; y++) {
    const oy = Math.min(sh - 1, (((y + 0.5) / dh) * sh) | 0)
    for (let x = 0; x < dw; x++) {
      const ox = Math.min(sw - 1, (((x + 0.5) / dw) * sw) | 0)
      out[y * dw + x] = src[oy * sw + ox] ? 1 : 0
    }
  }
  return out
}
