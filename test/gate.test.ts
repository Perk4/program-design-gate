import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { gate } from "../src/gate.ts";
import { lockSignatures } from "../src/signatures.ts";
import { writeSurface } from "../src/surface.ts";
import { ARTIFACTS } from "../src/types.ts";
import { artifactPath } from "../src/fs.ts";

const dirs: string[] = [];

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function workDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pdg-"));
  dirs.push(dir);
  return dir;
}

describe("gate", () => {
  it("fails when no artifacts exist", async () => {
    const dir = await workDir();
    const result = await gate(dir);
    expect(result).toEqual({
      ok: false,
      missing: [
        `missing ${ARTIFACTS.surface}`,
        `missing ${ARTIFACTS.signatures}`,
        `missing ${ARTIFACTS.slices}`,
      ],
    });
  });

  it("fails when only surface exists", async () => {
    const dir = await workDir();
    await writeSurface({
      dir,
      problem: "Clerks lose the last count.",
      measure: "increment(1) from 0 returns 1.",
    });
    const result = await gate(dir);
    expect(result).toEqual({
      ok: false,
      missing: [`missing ${ARTIFACTS.signatures}`, `missing ${ARTIFACTS.slices}`],
    });
  });

  it("fails when slices.md has fewer than two slices", async () => {
    const dir = await workDir();
    await writeSurface({
      dir,
      problem: "Clerks lose the last count.",
      measure: "increment(1) from 0 returns 1.",
    });
    await lockSignatures({
      dir,
      apiStub: {
        types: [],
        methods: [{ name: "increment", params: [{ name: "by", type: "number" }], returns: "number" }],
      },
    });
    await mkdir(join(dir, "docs"), { recursive: true });
    await writeFile(
      artifactPath(dir, ARTIFACTS.slices),
      "# Slices\n\n## 1. stub. end-to-end stub\n\nHardcoded increment.\n",
      "utf8",
    );
    const result = await gate(dir);
    expect(result).toEqual({
      ok: false,
      missing: [`need at least 2 slices in ${ARTIFACTS.slices}`],
    });
  });
});
