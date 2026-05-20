<div align="center">

<img src="assets/logo.png" width="288" height="288" alt="@coroboros/sparkline"/>

<!-- omit in toc -->
# @coroboros/sparkline

**Lightweight, zero-dependency SVG sparkline generator for Node.js.**

Calculates polyline points from a numeric series and returns a pure SVG string. Tune width, height, stroke, coordinate precision, and accessibility metadata.

[![npm](https://img.shields.io/npm/v/@coroboros/sparkline?style=flat-square&color=000000)](https://www.npmjs.com/package/@coroboros/sparkline)
[![ci](https://img.shields.io/github/actions/workflow/status/coroboros/sparkline/ci.yml?branch=main&style=flat-square&label=ci&color=000000)](https://github.com/coroboros/sparkline/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-000000?style=flat-square)](https://opensource.org/licenses/MIT)
[![stars](https://img.shields.io/github/stars/coroboros/sparkline?style=flat-square&label=stars&color=000000)](https://github.com/coroboros/sparkline)
[![coroboros.com](https://img.shields.io/badge/coroboros.com-000000?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cGF0aCBkPSJNMiAxMmgyME0xMiAyYTE1LjMgMTUuMyAwIDAgMSA0IDEwIDE1LjMgMTUuMyAwIDAgMS00IDEwIDE1LjMgMTUuMyAwIDAgMS00LTEwIDE1LjMgMTUuMyAwIDAgMSA0LTEweiIvPjwvc3ZnPg==)](https://coroboros.com)

</div>

<!-- omit in toc -->
## Contents

- [Requirements](#requirements)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Requirements

- Node.js `>=22` LTS. Use [fnm](https://github.com/Schniz/fnm) for version management — Rust-based, faster than nvm.
- Any of the following package managers: `pnpm`, `npm`, `yarn`, `bun`.

## Install

```bash
pnpm add @coroboros/sparkline
```

```bash
npm install @coroboros/sparkline
```

```bash
yarn add @coroboros/sparkline
```

```bash
bun add @coroboros/sparkline
```

## Usage

```ts
// ESM (recommended)
import { sparkline } from '@coroboros/sparkline';
```

```js
// CommonJS
const { sparkline } = require('@coroboros/sparkline');
```

```ts
import { sparkline, SparklineError } from '@coroboros/sparkline';

const values = [10, 50, 50, 200, 0];

try {
  const svg = sparkline(values, {
    width: 135,
    height: 50,
    stroke: '#C9A96E',
    strokeWidth: 1.25,
    strokeOpacity: 1,
    precision: 2,
    title: 'Price (24h)',
    ariaLabel: 'Price trend over the last 24 hours',
    description: 'Hourly close for the last 24 hours.',
  });
  // svg is a string containing <svg>…<polyline/>…</svg>
} catch (err) {
  if (err instanceof SparklineError) {
    console.error(err.code, err.message);
  }
}
```

## API

### Types

<details>
<summary><code>SparklineOptions</code></summary>

<br>

Style and accessibility options for [`sparkline`](#api). Every field is optional. Invalid style options (`width`, `height`, `stroke`, `strokeWidth`, `strokeOpacity`, `precision`) fall back silently to their defaults.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | `135` | SVG width, in pixels. Must be `> 0`. |
| `height` | `number` | `50` | SVG height, in pixels. Must be `> 0`. |
| `stroke` | `string` | `#C9A96E` | Stroke color — CSS named color, hex (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`), or functional notation (`rgb()`, `rgba()`, `hsl()`, `oklch()`, …). |
| `strokeWidth` | `number` | `1.25` | Stroke width, in pixels. Must be `>= 0`. `0` produces an invisible polyline. |
| `strokeOpacity` | `number` | `1` | Stroke opacity, in `[0, 1]`. |
| `precision` | `integer` | `2` | Decimal places kept on every coordinate. Integer in `[0, 6]`. Lower values produce smaller SVGs. |
| `title` | `string` | *(optional)* | Adds a `<title>` element and sets `role="img"` plus `aria-label` on the root `<svg>` (when `ariaLabel` is omitted). |
| `ariaLabel` | `string` | *(optional)* | Explicit `aria-label` on the root `<svg>`. Takes precedence over `title` for the accessible name. |
| `description` | `string` | *(optional)* | Adds a `<desc>` element for screen-reader long-form context. |

</details>

<details>
<summary><code>SparklineError</code></summary>

<br>

Thrown by [`sparkline`](#api). Inherits from `Error`. See [Errors](#errors) for the code list.

```ts
class SparklineError extends Error {
  readonly name: 'SparklineError';
  readonly code: SparklineErrorCode;
  readonly message: string;
}
```

</details>

<details>
<summary><code>SparklineErrorCode</code></summary>

<br>

```ts
type SparklineErrorCode = 'MISSING_VALUES' | 'INVALID_VALUES' | 'EMPTY_VALUES';
```

</details>

<details>
<summary><code>sparkline(values, options?)</code></summary>

<br>

Generate an SVG sparkline from an array of numeric values.

**Parameters**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `values` | `ReadonlyArray<number>` | *(required)* | Finite numbers used to draw the sparkline. Must contain at least one element. |
| `options?` | [`SparklineOptions`](#types) | `{}` | Style and accessibility overrides. |

**Returns** — `string`. The SVG markup including `<polyline>`.

**Throws** — [`SparklineError`](#types). Invalid `values` throw with one of [`MISSING_VALUES`, `INVALID_VALUES`, `EMPTY_VALUES`](#errors). Invalid style options fall back silently to their defaults.

**Notes** — See [`bench/baseline.md`](bench/baseline.md) for SVG-render timings.

**Examples**

```ts
sparkline([10, 50, 50, 200, 0]);
// → <svg viewBox="0 0 135 50" ...><polyline .../></svg>

sparkline([1, 2, 3, 2, 1], {
  width: 200,
  height: 60,
  strokeWidth: 2,
  ariaLabel: 'Trend',
});
// → accessible SVG with role="img" and aria-label="Trend"

try {
  sparkline([]);
} catch (err) {
  if (err instanceof SparklineError) {
    err.code; // 'EMPTY_VALUES'
  }
}
```

</details>

### Accessibility

The polyline is inset by `strokeWidth / 2` so stroke caps never clip the viewBox edges.

When none of `title`, `ariaLabel`, or `description` are provided, the SVG is marked `aria-hidden="true"` — treat it as decorative. Pass any of them to opt into an accessible image: the root gets `role="img"` plus `aria-label` (from `ariaLabel` or `title`), and `<title>` / `<desc>` nest inside the SVG.

### Gallery

Rendered examples live in [`assets/examples`](assets/examples).

![Bitcoin](assets/examples/bitcoin/sparkline.svg "Bitcoin")
![Ethereum](assets/examples/ethereum/sparkline.svg "Ethereum")
![Chainlink](assets/examples/chainlink/sparkline.svg "Chainlink")
![Kusama](assets/examples/kusama/sparkline.svg "Kusama")
![Tether](assets/examples/tether/sparkline.svg "Tether")

### Errors

| Code | Description |
| --- | --- |
| `MISSING_VALUES` | The `values` option is missing. |
| `INVALID_VALUES` | `values` is not an array, or contains non-finite numbers. |
| `EMPTY_VALUES` | `values` is an empty array. |

### Debugging

The library uses Node's built-in [`util.debuglog`](https://nodejs.org/api/util.html#utildebuglogsection-callback). Enable it with:

```bash
NODE_DEBUG=sparkline node your-script.js
```

## Contributing

Bug reports and PRs welcome.

- Open an issue before submitting non-trivial PRs.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/).
- Run `pnpm lint && pnpm typecheck && pnpm test` before pushing.
- Target the `main` branch.

## License

[MIT](LICENSE.md)
