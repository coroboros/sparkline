# @coroboros/sparkline

Zero-dependency SVG sparkline generator. Takes a numeric array and returns a polyline-based SVG string, with tunable geometry, stroke, decimal precision, and a11y metadata.

## Canonical rules

Follows the Coroboros engineering global rules. Repo-specific divergences are stated inline in `## Rules` below.

## Tech Stack
- TypeScript strict, ES modules + CJS dual build (tsdown)
- Vitest + `fast-check` for property tests, Biome for lint/format
- `mitata` for benchmarks (`pnpm bench`)
- Node.js 22 LTS
- Zero runtime dependencies — debugging uses Node's `node:util.debuglog`

## Commands
- `pnpm build` — bundle ESM + CJS + types to `dist/`
- `pnpm test` — run the Vitest suite (52 tests, incl. property-based)
- `pnpm lint` / `pnpm lint:fix` — Biome check
- `pnpm typecheck` — tsc --noEmit
- `pnpm bench` — build then run `bench/sparkline.bench.mjs`
- `pnpm dev` — tsdown watch mode

## Important Files
- `src/index.ts` — public entry: `sparkline(values, options?)`, `SparklineError`, `SparklineOptions`, `SparklineErrorCode`
- `src/validate.ts` — runtime validation of options; exports `SparklineOptions` and `ValidatedOptions`
- `src/render.ts` — SVG assembly (polyline points, a11y, XML escaping)
- `src/error.ts` — `SparklineError` class with `code` + `cause`
- `tests/` — one spec per source module + `sparkline.property.test.ts` for `fast-check` invariants
- `bench/sparkline.bench.mjs` — mitata bench; `bench/baseline.md` documents 1.0.0 numbers
- `tsdown.config.ts` — dual build config (ESM + CJS + dts)

## Public API (1.0.0 contract)
- `sparkline(values: ReadonlyArray<number>, options?: SparklineOptions): string` — positional, mirrors `fetch(url, init)`
- Options: `width`, `height`, `stroke` (default `#C9A96E`), `strokeWidth`, `strokeOpacity`, `precision` (default `2`, range `[0, 6]`), `title`, `ariaLabel`, `description`
- Decorative-by-default a11y: SVG is `aria-hidden="true"` unless any of `title` / `ariaLabel` / `description` is set
- Polyline is inset by `strokeWidth / 2` so stroke caps never clip the viewBox
- `SparklineError` extends `Error` with `code: 'MISSING_VALUES' | 'INVALID_VALUES' | 'EMPTY_VALUES'` and supports `Error.cause`

## Rules
- **NEVER** break the public API above. `sparkline(values, options?)` and `SparklineError` shape are contract.
- **NEVER** add a runtime dependency. The "zero-dependency" promise is a feature.
- **NEVER** replace `node:util.debuglog` with the `debug` npm package.
- Run `pnpm lint && pnpm typecheck && pnpm test` before every commit.
- Run `pnpm bench` against `bench/baseline.md` when touching `src/render.ts` — no regression > 5 % at fixed feature set.
- Scoped package — `publishConfig.access = "public"` is mandatory, do not remove.
- **Publish** — npm token (`NPM_PACKAGE_REGISTRY_TOKEN`), locked. OIDC Trusted Publisher is unavailable for this repo; keep the token in `ci.yml` and never attempt the OIDC switch.
- **Git** — `main`-only; branch → PR → squash-merge → tag the merge commit. The tag is the only manual step; release automation (version bump, `CHANGELOG.md`, npm publish, GitHub release) is owned by [`coroboros/ci`](https://github.com/coroboros/ci). Never hand-edit `package.json` version or `CHANGELOG.md`. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` before tagging.
