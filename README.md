# program-design-gate

Agents start coding too soon. This repo is the design gate as four TypeScript functions: `writeSurface`, `lockSignatures`, `planSlices`, `gate`.

Not Dexter. Not a product. No LLM on the default path. Complementary to [atomic-verify-loop](https://github.com/Perk4/atomic-verify-loop), which is propose → measure → review → decide. This gate runs first. Refuse implementation until the three docs exist.

The talk is [Dex Horthy on David Ondrej](https://www.youtube.com/watch?v=xgkjtF89-44). That workflow is product, architecture, program design, then vertical slices. This example writes the product surface, locked signatures, and the slice list, then stops.

## The four steps

**writeSurface({ problem, measure }).** Writes `docs/surface.md`. `problem` is the user job. `measure` is how you know it worked. No endpoints, tables, or types here.

**lockSignatures(apiStub).** Writes `docs/signatures.md`. `apiStub` is types plus method signatures. There is no body field. A method line that opens a `{` without closing it is rejected.

**planSlices(surface, signatures).** Writes `docs/slices.md`. Always three ordered slices: end-to-end stub, happy-path logic, then errors.

**gate(dir).** Reads those three files. Exit 0 only when all three exist and `docs/slices.md` has at least two `## ` headings. Otherwise exit 1 and print what is missing. No model call. File checks only.

## Run

```sh
npm install
npm test
npm run typecheck
npm run gate
npm run happy-path
```

`npm run gate` against `fixtures/toy` exits 1. That directory has no `docs/` yet.

`npm run happy-path` writes the three files into `fixtures/toy/docs/` and then `gate` prints `ok`.

Tests write a temp directory. They do not use leftover files in `fixtures/toy/docs`.

## Fixture

`fixtures/toy` is a clerk counter with no product code. The happy path invents `increment` and `value` so the docs have somewhere to point.
