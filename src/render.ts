import type { ValidatedOptions } from './validate.js';

const escapeXml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const render = (options: ValidatedOptions): string => {
  const {
    values,
    width,
    height,
    stroke,
    strokeWidth,
    strokeOpacity,
    title,
    ariaLabel,
    description,
    precision,
  } = options;
  const n = values.length;

  let min = values[0] as number;
  let max = min;
  for (let i = 1; i < n; i += 1) {
    const v = values[i] as number;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const diff = max - min;

  const inset = strokeWidth / 2;
  const innerWidth = Math.max(0, width - strokeWidth);
  const innerHeight = Math.max(0, height - strokeWidth);
  const stepX = n === 1 ? 0 : innerWidth / (n - 1);
  const midY = height / 2;
  const factor = 10 ** precision;

  const points: string[] = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const rawX = n === 1 ? width / 2 : inset + i * stepX;
    const rawY = diff === 0 ? midY : inset + ((max - (values[i] as number)) / diff) * innerHeight;
    const x = Math.round(rawX * factor) / factor;
    const y = Math.round(rawY * factor) / factor;
    points[i] = `${x},${y}`;
  }

  const svgAttrs: string[] = [
    'xmlns="http://www.w3.org/2000/svg"',
    `width="${width}"`,
    `height="${height}"`,
    `viewBox="0 0 ${width} ${height}"`,
  ];

  let body = '';
  const hasAccessibleContent =
    title !== undefined || ariaLabel !== undefined || description !== undefined;

  if (hasAccessibleContent) {
    svgAttrs.push('role="img"');
    const label = ariaLabel ?? title;
    if (label !== undefined) {
      svgAttrs.push(`aria-label="${escapeXml(label)}"`);
    }
    if (title !== undefined) {
      body += `<title>${escapeXml(title)}</title>`;
    }
    if (description !== undefined) {
      body += `<desc>${escapeXml(description)}</desc>`;
    }
  } else {
    svgAttrs.push('aria-hidden="true"');
  }

  body +=
    `<polyline points="${points.join(' ')}"` +
    ` fill="none"` +
    ` stroke="${escapeXml(stroke)}"` +
    ` stroke-width="${strokeWidth}"` +
    ` stroke-opacity="${strokeOpacity}"/>`;

  return `<svg ${svgAttrs.join(' ')}>${body}</svg>`;
};
