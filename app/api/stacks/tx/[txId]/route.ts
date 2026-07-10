import { NextResponse } from "next/server";
import { getStacksApiUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ txId: string }>;
};

const failedStatuses = new Set([
  "abort_by_response",
  "abort_by_post_condition",
  "dropped_replace_by_fee",
  "dropped_replace_across_fork",
  "dropped_too_expensive",
  "dropped_stale_garbage_collect",
  "dropped_problematic"
]);

export async function GET(_request: Request, context: RouteContext) {
  const { txId: rawTxId } = await context.params;
  const txId = rawTxId.startsWith("0x") ? rawTxId : `0x${rawTxId}`;

  try {
    const response = await fetch(
      `${getStacksApiUrl()}/extended/v1/tx/${encodeURIComponent(txId)}`,
      { cache: "no-store" }
    );

    if (response.status === 404) {
      return NextResponse.json({ phase: "pending", txId });
    }

    const body = (await response.json()) as {
      tx_status?: string;
      error?: string;
      reason?: string;
    };

    if (!response.ok) {
      throw new Error(body.error || body.reason || "Could not read transaction status.");
    }

    const status = body.tx_status || "pending";
    const phase =
      status === "success"
        ? "confirmed"
        : failedStatuses.has(status)
          ? "failed"
          : "pending";

    return NextResponse.json({ phase, txId, status });
  } catch (error) {
    return NextResponse.json(
      {
        phase: "pending",
        txId,
        error: error instanceof Error ? error.message : "Could not read transaction status."
      },
      { status: 502 }
    );
  }
}
