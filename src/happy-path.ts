import { lockSignatures } from "./signatures.ts";
import { planSlices } from "./slices.ts";
import { writeSurface } from "./surface.ts";
import type { ApiStub, Surface } from "./types.ts";

export const TOY_SURFACE = {
  problem: "A clerk needs a counter that remembers its value across increments.",
  measure: "From 0, increment(1) returns 1. A second increment(1) returns 2.",
} as const satisfies Surface;

export const TOY_STUB = {
  types: [{ name: "Counter", fields: [{ name: "value", type: "number" }] }],
  methods: [
    { name: "increment", params: [{ name: "by", type: "number" }], returns: "number" },
    { name: "value", params: [], returns: "number" },
  ],
} as const satisfies ApiStub;

export async function happyPath(dir: string): Promise<void> {
  await writeSurface({ dir, ...TOY_SURFACE });
  await lockSignatures({ dir, apiStub: TOY_STUB });
  await planSlices({ dir, surface: TOY_SURFACE, signatures: TOY_STUB });
}
