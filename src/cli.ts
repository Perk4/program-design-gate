import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gate } from "./gate.ts";
import { happyPath } from "./happy-path.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const defaultDir = join(root, "fixtures", "toy");

const command = process.argv[2];
const dir = process.argv[3] ?? defaultDir;

if (command !== "gate" && command !== "happy-path") {
  process.stderr.write("usage: program-design-gate <gate|happy-path> [dir]\n");
  process.exit(1);
}

if (command === "happy-path") {
  await happyPath(dir);
}

const result = await gate(dir);
if (!result.ok) {
  process.stderr.write(`${result.missing.join("\n")}\n`);
  process.exit(1);
}

process.stdout.write("ok\n");
