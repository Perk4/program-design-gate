import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export function artifactPath(dir: string, relative: string): string {
  return join(dir, relative);
}

export async function writeArtifact(dir: string, relative: string, body: string): Promise<string> {
  const path = artifactPath(dir, relative);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, body, "utf8");
  return path;
}

export function requireText(value: string, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${label} is required`);
  }
  return trimmed;
}
