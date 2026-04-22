import { parse } from 'svg-parser';
import { describe, expect, it } from 'vitest';
import { render } from '../src/render.js';
import type { ValidatedOptions } from '../src/validate.js';

const base: ValidatedOptions = {
  values: [10, 50, 50, 200, 0],
  width: 200,
  height: 50,
  stroke: 'blue',
  strokeWidth: 1.25,
  strokeOpacity: 1,
  title: undefined,
  ariaLabel: undefined,
  description: undefined,
  precision: 2,
};

describe('render', () => {
  it('produces standard x,y pairs inset by strokeWidth/2', () => {
    const svg = render(base);
    const parsed = parse(svg);
    const root = parsed.children[0] as {
      tagName: string;
      properties: Record<string, unknown>;
      children: { tagName: string; properties: Record<string, unknown> }[];
    };
    expect(root.tagName).toBe('svg');
    expect(root.properties.width).toBe(200);
    expect(root.properties.height).toBe(50);
    expect(root.properties.viewBox).toBe('0 0 200 50');
    const polyline = root.children[0] as {
      tagName: string;
      properties: Record<string, unknown>;
    };
    expect(polyline.tagName).toBe('polyline');
    expect(polyline.properties.points).toBe(
      '0.63,46.94 50.31,37.19 100,37.19 149.69,0.63 199.38,49.38',
    );
    expect(polyline.properties.fill).toBe('none');
    expect(polyline.properties.stroke).toBe('blue');
    expect(polyline.properties['stroke-width']).toBe(1.25);
    expect(polyline.properties['stroke-opacity']).toBe(1);
  });

  it('renders a flat series as a horizontal line at mid-height', () => {
    const svg = render({ ...base, values: [7, 7, 7, 7] });
    const parsed = parse(svg);
    const root = parsed.children[0] as {
      children: { properties: Record<string, unknown> }[];
    };
    const polyline = root.children[0] as { properties: Record<string, unknown> };
    expect(polyline.properties.points).toBe('0.63,25 66.88,25 133.13,25 199.38,25');
  });

  it('renders a single-value series as a centered point', () => {
    const svg = render({ ...base, values: [42] });
    const parsed = parse(svg);
    const root = parsed.children[0] as {
      children: { properties: Record<string, unknown> }[];
    };
    const polyline = root.children[0] as { properties: Record<string, unknown> };
    expect(polyline.properties.points).toBe('100,25');
  });

  it('insets the first and last x by strokeWidth/2 so caps fit in the viewBox', () => {
    const svg = render({ ...base, strokeWidth: 10, values: [1, 2] });
    const parsed = parse(svg);
    const root = parsed.children[0] as {
      children: { properties: Record<string, unknown> }[];
    };
    const polyline = root.children[0] as { properties: Record<string, unknown> };
    const pts = (polyline.properties.points as string).split(' ').map((p) => p.split(','));
    expect(Number(pts[0]?.[0])).toBe(5);
    expect(Number(pts[1]?.[0])).toBe(195);
  });

  it('respects precision=0 (integer rounding)', () => {
    const svg = render({ ...base, values: [7, 7, 7, 7], precision: 0 });
    const parsed = parse(svg);
    const root = parsed.children[0] as {
      children: { properties: Record<string, unknown> }[];
    };
    const polyline = root.children[0] as { properties: Record<string, unknown> };
    expect(polyline.properties.points).toBe('1,25 67,25 133,25 199,25');
  });

  it('respects precision=4 for higher fidelity', () => {
    const svg = render({ ...base, values: [7, 7, 7, 7], precision: 4 });
    const parsed = parse(svg);
    const root = parsed.children[0] as {
      children: { properties: Record<string, unknown> }[];
    };
    const polyline = root.children[0] as { properties: Record<string, unknown> };
    expect(polyline.properties.points).toBe('0.625,25 66.875,25 133.125,25 199.375,25');
  });

  it('injects a <title> and role + aria-label when title is set', () => {
    const svg = render({ ...base, title: 'BTC' });
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="BTC"');
    expect(svg).toContain('<title>BTC</title>');
  });

  it('uses ariaLabel as accessible name when provided alongside title', () => {
    const svg = render({ ...base, title: 'BTC', ariaLabel: 'Bitcoin price trend' });
    expect(svg).toContain('aria-label="Bitcoin price trend"');
    expect(svg).toContain('<title>BTC</title>');
  });

  it('escapes XML special characters in user-supplied strings', () => {
    const svg = render({ ...base, title: '<script>&"</script>', ariaLabel: 'a"b<c' });
    expect(svg).toContain('<title>&lt;script&gt;&amp;&quot;&lt;/script&gt;</title>');
    expect(svg).toContain('aria-label="a&quot;b&lt;c"');
  });

  it('marks the SVG aria-hidden when no title / ariaLabel / description is provided', () => {
    const svg = render(base);
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).not.toContain('role=');
    expect(svg).not.toContain('<title>');
    expect(svg).not.toContain('<desc>');
    expect(svg).not.toContain('aria-label');
  });

  it('injects <desc> when description is set and promotes the SVG to role=img', () => {
    const svg = render({ ...base, description: 'Hourly mid-price over 24h' });
    expect(svg).toContain('role="img"');
    expect(svg).not.toContain('aria-hidden');
    expect(svg).toContain('<desc>Hourly mid-price over 24h</desc>');
  });

  it('escapes XML in description', () => {
    const svg = render({ ...base, description: '<a>&"' });
    expect(svg).toContain('<desc>&lt;a&gt;&amp;&quot;</desc>');
  });
});
