import { requireText, writeArtifact } from "./fs.ts";
import { ARTIFACTS, type ApiStub, type MethodSig, type TypeDecl } from "./types.ts";

function lineHasMethodBody(line: string): boolean {
  if (/\)\s*\{/.test(line)) {
    return true;
  }
  return line.includes("{") && !line.includes("}");
}

function formatFields(decl: TypeDecl): string {
  const fields = decl.fields
    .map((field) => `${requireText(field.name, "field name")}: ${requireText(field.type, "field type")}`)
    .join("; ");
  return `- ${requireText(decl.name, "type name")}: { ${fields} }`;
}

function formatMethod(method: MethodSig): string {
  const params = method.params
    .map((param) => `${requireText(param.name, "param name")}: ${requireText(param.type, "param type")}`)
    .join(", ");
  return `- ${requireText(method.name, "method name")}(${params}): ${requireText(method.returns, "returns")}`;
}

function methodsSection(markdown: string): string {
  const marker = "## Methods\n";
  const index = markdown.indexOf(marker);
  if (index === -1) {
    return "";
  }
  return markdown.slice(index + marker.length);
}

function assertNoMethodBodies(markdown: string): void {
  const hasBody = methodsSection(markdown)
    .split("\n")
    .some((line) => lineHasMethodBody(line));
  if (hasBody) {
    throw new Error("function bodies are forbidden");
  }
}

function renderSignatures(apiStub: ApiStub): string {
  if (apiStub.methods.length === 0) {
    throw new Error("at least one method is required");
  }
  const types =
    apiStub.types.length === 0
      ? "- (none)"
      : apiStub.types.map(formatFields).join("\n");
  const methods = apiStub.methods.map(formatMethod).join("\n");
  const markdown = `# Signatures

## Types

${types}

## Methods

${methods}
`;
  assertNoMethodBodies(markdown);
  return markdown;
}

export async function lockSignatures(input: { dir: string; apiStub: ApiStub }): Promise<string> {
  const body = renderSignatures(input.apiStub);
  return await writeArtifact(input.dir, ARTIFACTS.signatures, body);
}
