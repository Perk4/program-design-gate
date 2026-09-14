import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { lockSignatures } from "../src/signatures.ts";
import { ARTIFACTS } from "../src/types.ts";
import { artifactPath } from "../src/fs.ts";

const dirs: string[] = [];

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function workDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "pdg-sig-"));
  dirs.push(dir);
  return dir;
}

describe("lockSignatures", () => {
  it("writes types and method signatures with no bodies", async () => {
    const dir = await workDir();
    await lockSignatures({
      dir,
      apiStub: {
        types: [{ name: "Counter", fields: [{ name: "value", type: "number" }] }],
        methods: [
          { name: "increment", params: [{ name: "by", type: "number" }], returns: "number" },
        ],
      },
    });
    const markdown = await readFile(artifactPath(dir, ARTIFACTS.signatures), "utf8");
    expect(markdown).toContain("- increment(by: number): number");
    expect(markdown).not.toMatch(/\)\s*\{/);
  });

  it("allows an object return type on one line", async () => {
    const dir = await workDir();
    await lockSignatures({
      dir,
      apiStub: {
        types: [],
        methods: [{ name: "snapshot", params: [], returns: "{ value: number }" }],
      },
    });
    const markdown = await readFile(artifactPath(dir, ARTIFACTS.signatures), "utf8");
    expect(markdown).toContain("- snapshot(): { value: number }");
  });

  it("rejects a smuggled method body", async () => {
    const dir = await workDir();
    await expect(
      lockSignatures({
        dir,
        apiStub: {
          types: [],
          methods: [{ name: "increment", params: [], returns: "number {" }],
        },
      }),
    ).rejects.toThrow("function bodies are forbidden");
  });
});
