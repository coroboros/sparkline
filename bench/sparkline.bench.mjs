/**
 * Micro-benchmark for sparkline over 4 input sizes.
 *
 * Usage (from the package root):
 *   pnpm build && node bench/sparkline.bench.mjs
 */
import { bench, group, run } from 'mitata';
import { sparkline } from '../dist/index.mjs';

const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
};

const makeSeries = (n, seed = 42) => {
  const r = rng(seed);
  const out = new Array(n);
  for (let i = 0; i < n; i += 1) out[i] = r() * 1000 - 500;
  return out;
};

const SERIES = {
  'n=5': makeSeries(5),
  'n=100': makeSeries(100),
  'n=1000': makeSeries(1000),
  'n=10000': makeSeries(10000),
};

for (const [label, values] of Object.entries(SERIES)) {
  group(label, () => {
    bench('sparkline(values)', () => {
      sparkline(values);
    });
  });
}

await run({ colors: true });
