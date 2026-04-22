import fc from 'fast-check';
import { parse } from 'svg-parser';
import { describe, expect, it } from 'vitest';
import { sparkline } from '../src/index.js';

const finiteFloat = fc.float({ noNaN: true, noDefaultInfinity: true, min: -1e6, max: 1e6 });

const series = fc.array(finiteFloat, { minLength: 1, maxLength: 500 });

const positiveDim = fc.integer({ min: 1, max: 1000 });
const precisionInt = fc.integer({ min: 0, max: 6 });

const getPolylinePoints = (svg: string): string => {
  const root = parse(svg).children[0] as {
    children: { tagName: string; properties: Record<string, unknown> }[];
  };
  const polyline = root.children.find((c) => c.tagName === 'polyline');
  return polyline?.properties?.points as string;
};

describe('sparkline — property tests', () => {
  it('always produces a parseable SVG with one polyline and |values| points', () => {
    fc.assert(
      fc.property(series, (values) => {
        const svg = sparkline(values);
        expect(svg.startsWith('<svg ')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
        const points = getPolylinePoints(svg).split(' ');
        expect(points).toHaveLength(values.length);
        for (const p of points) {
          const parts = p.split(',');
          expect(parts).toHaveLength(2);
          expect(Number.isFinite(Number(parts[0]))).toBe(true);
          expect(Number.isFinite(Number(parts[1]))).toBe(true);
        }
      }),
    );
  });

  it('keeps every coordinate inside [inset, width-inset] × [inset, height-inset]', () => {
    fc.assert(
      fc.property(
        series,
        positiveDim,
        positiveDim,
        fc.float({ min: 0, max: 10, noNaN: true }),
        (values, width, height, strokeWidth) => {
          fc.pre(strokeWidth * 2 < width && strokeWidth * 2 < height);
          const precision = 6;
          const inset = strokeWidth / 2;
          const svg = sparkline(values, { width, height, strokeWidth, precision });
          const points = getPolylinePoints(svg).split(' ');
          const epsilon = 0.5 * 10 ** -precision;
          for (const p of points) {
            const parts = p.split(',');
            const x = Number(parts[0]);
            const y = Number(parts[1]);
            expect(x).toBeGreaterThanOrEqual(inset - epsilon);
            expect(x).toBeLessThanOrEqual(width - inset + epsilon);
            expect(y).toBeGreaterThanOrEqual(inset - epsilon);
            expect(y).toBeLessThanOrEqual(height - inset + epsilon);
          }
        },
      ),
    );
  });

  it('emits at most `precision` decimals on any coordinate', () => {
    fc.assert(
      fc.property(series, precisionInt, (values, precision) => {
        const svg = sparkline(values, { precision });
        const points = getPolylinePoints(svg).split(' ');
        for (const p of points) {
          for (const part of p.split(',')) {
            const dot = part.indexOf('.');
            const decimals = dot === -1 ? 0 : part.length - dot - 1;
            expect(decimals).toBeLessThanOrEqual(precision);
          }
        }
      }),
    );
  });

  it('falls back to the default stroke for any invalid color input', () => {
    fc.assert(
      fc.property(
        series,
        fc.oneof(
          fc.constant('notacolor'),
          fc.constant('#12'),
          fc.constant('rgb'),
          fc.constant(''),
          fc.constant('   '),
        ),
        (values, bad) => {
          const svg = sparkline(values, { stroke: bad });
          expect(svg).toContain('stroke="#C9A96E"');
        },
      ),
    );
  });
});
