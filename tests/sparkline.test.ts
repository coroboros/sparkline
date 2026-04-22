import { parse } from 'svg-parser';
import { describe, expect, it } from 'vitest';
import { SparklineError, sparkline } from '../src/index.js';

const values = [10, 50, 50, 200, 0];

const parsePolyline = (svg: string) => {
  const root = parse(svg).children[0] as {
    tagName: string;
    properties: Record<string, unknown>;
    children: { tagName: string; properties: Record<string, unknown> }[];
  };
  const polyline = root.children.find((c) => c.tagName === 'polyline') as {
    tagName: string;
    properties: Record<string, unknown>;
  };
  return { root, polyline };
};

describe('sparkline', () => {
  it('exports a function named sparkline', () => {
    expect(typeof sparkline).toBe('function');
    expect(sparkline.name).toBe('sparkline');
  });

  it('throws SparklineError when called without values', () => {
    expect(() => (sparkline as () => string)()).toThrow(SparklineError);
    try {
      (sparkline as () => string)();
    } catch (e) {
      expect((e as SparklineError).code).toBe('MISSING_VALUES');
      expect((e as SparklineError).name).toBe('SparklineError');
    }
  });

  it('throws INVALID_VALUES when values is not an array', () => {
    for (const bad of [true, 15, '1,2,3']) {
      try {
        sparkline(bad as never);
        throw new Error('expected throw');
      } catch (e) {
        expect((e as SparklineError).code).toBe('INVALID_VALUES');
      }
    }
  });

  it('throws EMPTY_VALUES on empty array', () => {
    try {
      sparkline([]);
      throw new Error('expected throw');
    } catch (e) {
      expect((e as SparklineError).code).toBe('EMPTY_VALUES');
    }
  });

  it('renders default styling when only values are provided', () => {
    const svg = sparkline(values);
    const { root, polyline } = parsePolyline(svg);
    expect(root.properties.width).toBe(135);
    expect(root.properties.height).toBe(50);
    expect(polyline.properties.stroke).toBe('#C9A96E');
    expect(polyline.properties['stroke-width']).toBe(1.25);
    expect(polyline.properties['stroke-opacity']).toBe(1);
  });

  it('honors all options when valid', () => {
    const svg = sparkline(values, {
      width: 250,
      height: 100,
      stroke: 'blue',
      strokeWidth: 2,
      strokeOpacity: 0.5,
    });
    const { root, polyline } = parsePolyline(svg);
    expect(root.properties.width).toBe(250);
    expect(root.properties.height).toBe(100);
    expect(polyline.properties.stroke).toBe('blue');
    expect(polyline.properties['stroke-width']).toBe(2);
    expect(polyline.properties['stroke-opacity']).toBe(0.5);
  });

  it('respects strokeWidth 0 and strokeOpacity 0', () => {
    const { polyline } = parsePolyline(sparkline(values, { strokeWidth: 0, strokeOpacity: 0 }));
    expect(polyline.properties['stroke-width']).toBe(0);
    expect(polyline.properties['stroke-opacity']).toBe(0);
  });

  it('falls back to defaults when numeric options are invalid', () => {
    const { root, polyline } = parsePolyline(
      sparkline(values, {
        width: -5,
        height: Number.NaN,
        strokeWidth: -1,
        strokeOpacity: 1.5,
      }),
    );
    expect(root.properties.width).toBe(135);
    expect(root.properties.height).toBe(50);
    expect(polyline.properties['stroke-width']).toBe(1.25);
    expect(polyline.properties['stroke-opacity']).toBe(1);
  });

  it('falls back to the default stroke when color is invalid', () => {
    const { polyline } = parsePolyline(sparkline(values, { stroke: 'notacolor' }));
    expect(polyline.properties.stroke).toBe('#C9A96E');
  });

  it('accepts modern CSS color notations', () => {
    const { polyline } = parsePolyline(sparkline(values, { stroke: 'oklch(0.72 0.15 140)' }));
    expect(polyline.properties.stroke).toBe('oklch(0.72 0.15 140)');
  });

  it('injects title + role + aria-label when title is set', () => {
    const svg = sparkline(values, { title: 'BTC' });
    expect(svg).toContain('<title>BTC</title>');
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="BTC"');
  });

  it('prefers ariaLabel over title for the accessible name', () => {
    const svg = sparkline(values, { title: 'BTC', ariaLabel: 'Bitcoin price trend' });
    expect(svg).toContain('<title>BTC</title>');
    expect(svg).toContain('aria-label="Bitcoin price trend"');
  });

  it('renders a single-value series', () => {
    const svg = sparkline([42]);
    const { polyline } = parsePolyline(svg);
    expect(polyline.properties.points).toBe('67.5,25');
  });

  it('escapes XML in user-supplied title / aria-label', () => {
    const svg = sparkline(values, { title: '<x>&"</x>' });
    expect(svg).toContain('<title>&lt;x&gt;&amp;&quot;&lt;/x&gt;</title>');
    expect(svg).toContain('aria-label="&lt;x&gt;&amp;&quot;&lt;/x&gt;"');
  });
});
