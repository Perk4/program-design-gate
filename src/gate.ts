import { readFile } from "node:fs/promises";
import { artifactPath } from "./fs.ts";
import { ARTIFACTS, MIN_SLICES, type GateResult } from "./types.ts";
import { countSlices } from "./slices.ts";

async function readOptional(dir: string, relative: string): Promise<string | null> {
  try {
    return await readFile(artifactPath(dir, relative), "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function gate(dir: string): Promise<GateResult> {
  const missing: string[] = [];
  const surface = await readOptional(dir, ARTIFACTS.surface);
  if (surface === null) {
    missing.push(`missing ${ARTIFACTS.surface}`);
  }
  const signatures = await readOptional(dir, ARTIFACTS.signatures);
  if (signatures === null) {
    missing.push(`missing ${ARTIFACTS.signatures}`);
  }
  const slices = await readOptional(dir, ARTIFACTS.slices);
  if (slices === null) {
    missing.push(`missing ${ARTIFACTS.slices}`);
  } else if (countSlices(slices) < MIN_SLICES) {
    missing.push(`need at least ${MIN_SLICES} slices in ${ARTIFACTS.slices}`);
  }
  if (missing.length > 0) {
    return { ok: false, missing };
  }
  return { ok: true };
}
