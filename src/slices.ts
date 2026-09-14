import { requireText, writeArtifact } from "./fs.ts";
import { ARTIFACTS, type ApiStub, type Slice, type Surface } from "./types.ts";

function defaultSlices(surface: Surface, signatures: ApiStub): readonly Slice[] {
  const methods = signatures.methods.map((method) => method.name).join(", ");
  return [
    {
      kind: "stub",
      name: "end-to-end stub",
      intent: `Wire ${methods} with hardcoded responses so the flow in "${surface.problem}" runs end to end.`,
    },
    {
      kind: "logic",
      name: "happy path",
      intent: `Replace stubs with the real logic. Success is: ${surface.measure}`,
    },
    {
      kind: "errors",
      name: "errors",
      intent: "Reject invalid input and missing state for each method. Keep the happy path green.",
    },
  ];
}

function renderSlices(slices: readonly Slice[]): string {
  const body = slices
    .map((slice, index) => {
      const name = requireText(slice.name, "slice name");
      const intent = requireText(slice.intent, "slice intent");
      return `## ${index + 1}. ${slice.kind}. ${name}\n\n${intent}`;
    })
    .join("\n\n");
  return `# Slices

${body}
`;
}

export function countSlices(markdown: string): number {
  return markdown.split("\n").filter((line) => line.startsWith("## ")).length;
}

export async function planSlices(input: {
  dir: string;
  surface: Surface;
  signatures: ApiStub;
}): Promise<string> {
  const slices = defaultSlices(input.surface, input.signatures);
  return await writeArtifact(input.dir, ARTIFACTS.slices, renderSlices(slices));
}
