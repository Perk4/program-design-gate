import { requireText, writeArtifact } from "./fs.ts";
import { ARTIFACTS, type Surface } from "./types.ts";

export async function writeSurface(input: { dir: string } & Surface): Promise<string> {
  const problem = requireText(input.problem, "problem");
  const measure = requireText(input.measure, "measure");
  const body = `# Surface

## Problem

${problem}

## Measure

${measure}
`;
  return await writeArtifact(input.dir, ARTIFACTS.surface, body);
}
