# @coroboros/sparkline

Generate accessible SVG sparklines in Node.js 22+ with zero runtime dependencies.

## Project constraints

- Preserve the `sparkline(values, options?)` and `SparklineError` contracts in `README.md` and `src/index.ts`, including option defaults, error codes and output semantics.
- Keep the package free of runtime dependencies. Debugging uses `node:util.debuglog`.
- Preserve decorative-by-default accessibility, XML escaping and the stroke inset that prevents clipping. Rendering and validation live in `src/render.ts` and `src/validate.ts`.
- Preserve the public scoped package and dual ESM/CJS exports.

## Validation

Use the scripts in `package.json`. Source or dependency changes require `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`; documentation-only edits need Markdown and reference checks.

For rendering changes, run `pnpm bench` against the bucket budgets in `bench/baseline.md`. Reuse passing results while the tested inputs remain unchanged.

## Release

Target `main` through a PR and squash-merge the reviewed head. After release approval, tag the merge commit with the next SemVer. `.github/workflows/ci.yml` delegates version updates, changelog, npm publication and GitHub release to the shared package pipeline; leave those generated artifacts to CI. This package uses `NPM_PACKAGE_REGISTRY_TOKEN`; preserve that authentication choice and CI-only publication.
