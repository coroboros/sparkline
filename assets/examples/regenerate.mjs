/**
 * Regenerate the example SVGs shown in the README.
 *
 * Usage (from the package root):
 *   pnpm build
 *   node assets/examples/regenerate.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sparkline } from '../../dist/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const examples = readdirSync(here, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const name of examples) {
  const valuesPath = join(here, name, 'values.json');
  const values = JSON.parse(readFileSync(valuesPath, 'utf8'));
  const svg = sparkline(values, {
    width: 135,
    height: 50,
    stroke: '#C9A96E',
    strokeWidth: 1.25,
    strokeOpacity: 1,
  });
  writeFileSync(join(here, name, 'sparkline.svg'), svg);
  console.log(`wrote ${name}/sparkline.svg (${values.length} points)`);
}
