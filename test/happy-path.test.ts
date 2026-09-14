import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { gate } from "../src/gate.ts";
import { happyPath } from "../src/happy-path.ts";
import { ARTIFACTS } from "../src/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dirs: string[] = [];

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function workDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pdg-path-"));
  dirs.push(dir);
  return dir;
}

function runCli(args: string[]): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(join(root, "node_modules/.bin/tsx"), [join(root, "src/cli.ts"), ...args], {
    encoding: "utf8",
    cwd: root,
    env: process.env,
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

describe("happy path", () => {
  it("fails closed, then passes after writeSurface, lockSignatures, and planSlices", async () => {
    const dir = await workDir();
    const before = await gate(dir);
    expect(before).toEqual({
      ok: false,
      missing: [
        `missing ${ARTIFACTS.surface}`,
        `missing ${ARTIFACTS.signatures}`,
        `missing ${ARTIFACTS.slices}`,
      ],
    });

    await happyPath(dir);
    const after = await gate(dir);
    expect(after).toEqual({ ok: true });
  });

  it("CLI exits 1 before artifacts and 0 after happy-path", async () => {
    const dir = await workDir();
    const closed = runCli(["gate", dir]);
    expect(closed.status).toBe(1);
    expect(closed.stderr).toContain(`missing ${ARTIFACTS.surface}`);
    expect(closed.stderr).toContain(`missing ${ARTIFACTS.signatures}`);
    expect(closed.stderr).toContain(`missing ${ARTIFACTS.slices}`);

    const opened = runCli(["happy-path", dir]);
    expect(opened.status).toBe(0);
    expect(opened.stdout).toBe("ok\n");
  });
});
