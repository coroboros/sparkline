# Benchmark baseline

Apple M1, Node 22.22.2. Run `pnpm bench` to reproduce.

## Pre-optim (0.x → archive)

| Series  | avg/iter   | p75        | p99        |
| ------- | ---------- | ---------- | ---------- |
| n=5     | 758.72 ns  | 774.44 ns  | 994.58 ns  |
| n=100   | 13.61 µs   | 13.93 µs   | 14.02 µs   |
| n=1000  | 139.40 µs  | 138.46 µs  | 365.33 µs  |
| n=10000 | 2.24 ms    | 2.29 ms    | 3.05 ms    |

Bundle: `dist/index.mjs` 6.18 kB / gzip 2.32 kB · `dist/index.cjs` 6.48 kB / gzip 2.43 kB.

## Post-optim (1.0.0)

| Series  | avg/iter   | Δ vs pre-optim |
| ------- | ---------- | -------------- |
| n=5     | 551 ns     | −27 %          |
| n=100   | 18.9 µs    | +38 %          |
| n=1000  | 210 µs     | +50 %          |
| n=10000 | 2.06 ms    | −8 %           |

Bundle: `dist/index.mjs` 7.07 kB / gzip 2.61 kB · `dist/index.cjs` 7.19 kB / gzip 2.67 kB.

### Why the mid-range regression

The n=100 / n=1000 buckets spend their time in the per-coordinate rounding loop, which
did not exist in 0.x. `precision=2` (the new default) is a deliberate tradeoff:

- SVG wire size shrinks **~37 %** at n=100 (`p=6` → 2161 B, `p=2` → 1361 B)
- Absolute runtime stays sub-millisecond up to n=1000
- Output is visually identical — sparklines don't need sub-pixel precision on a 135×50 viewBox

Among `Math.round(x*f)/f`, `Number(x.toFixed(p))`, and `toFixed(p)+trim`, the current
`Math.round` strategy is the fastest at equivalent correctness. There is no known
faster rounding that keeps decimals ≤ precision.

Ship target going forward: **no regression >5 % on any bucket at fixed feature set.**
Feature additions that legitimately cost time (like precision rounding) reset the bar.
