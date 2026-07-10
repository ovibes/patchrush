import {
  cellCoordinates,
  type PatchCell
} from "@/lib/patchrush";

export type StacksContractRef = {
  address: string;
  name: string;
};

type JsonTuple = {
  type?: string;
  value?: Record<string, unknown>;
};

export function extractUint(json: unknown) {
  if (!json || typeof json !== "object") return 0;

  const record = json as Record<string, unknown>;
  const value = record.value;

  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseInt(value, 10) || 0;
  if (record.type === "uint" && typeof value === "bigint") return Number(value);
  if (record.type === "ok" && value) return extractUint(value);

  return 0;
}

export function extractBool(json: unknown): boolean {
  if (!json || typeof json !== "object") return false;

  const record = json as Record<string, unknown>;
  if (typeof record.value === "boolean") return record.value;
  if (record.type === "ok" && record.value) return extractBool(record.value);
  if (record.type === "true") return true;

  return false;
}

function unwrapPrincipal(value: unknown) {
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  return typeof record.value === "string" ? record.value : "";
}

function unwrapTuple(json: unknown) {
  if (!json || typeof json !== "object") return null;

  const record = json as JsonTuple;
  const okValue =
    record.type === "ok" && record.value && typeof record.value === "object"
      ? (record.value as JsonTuple)
      : record;

  if (okValue.type !== "tuple" || !okValue.value) return null;

  return okValue.value;
}

export function mapStacksCell(
  json: unknown,
  index: number,
  roundId: number
): PatchCell | null {
  const tuple = unwrapTuple(json);
  if (!tuple) return null;

  const owner = unwrapPrincipal(tuple.owner);
  if (!owner) return null;

  const { x, y } = cellCoordinates(index);

  return {
    index,
    x,
    y,
    owner,
    color: extractUint(tuple.color),
    score: extractUint(tuple.score),
    createdAt: extractUint(tuple["created-at"]) || roundId,
    boosts: extractUint(tuple.boosts),
    network: "stacks"
  };
}
