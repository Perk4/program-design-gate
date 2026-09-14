export type Surface = {
  readonly problem: string;
  readonly measure: string;
};

export type Field = {
  readonly name: string;
  readonly type: string;
};

export type TypeDecl = {
  readonly name: string;
  readonly fields: readonly Field[];
};

export type Param = {
  readonly name: string;
  readonly type: string;
};

export type MethodSig = {
  readonly name: string;
  readonly params: readonly Param[];
  readonly returns: string;
};

export type ApiStub = {
  readonly types: readonly TypeDecl[];
  readonly methods: readonly MethodSig[];
};

export type SliceKind = "stub" | "logic" | "errors";

export type Slice = {
  readonly kind: SliceKind;
  readonly name: string;
  readonly intent: string;
};

export type GatePass = {
  readonly ok: true;
};

export type GateFail = {
  readonly ok: false;
  readonly missing: readonly string[];
};

export type GateResult = GatePass | GateFail;

export const ARTIFACTS = {
  surface: "docs/surface.md",
  signatures: "docs/signatures.md",
  slices: "docs/slices.md",
} as const;

export const MIN_SLICES = 2;
