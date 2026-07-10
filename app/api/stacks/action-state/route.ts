import { NextResponse } from "next/server";
import { Cl, cvToJSON, fetchCallReadOnlyFunction } from "@stacks/transactions";
import { getStacksApiUrl, publicEnv } from "@/lib/env";
import { CELL_COUNT, normalizeRoundId } from "@/lib/patchrush";
import { extractBool } from "@/lib/stacks-cell-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sender = url.searchParams.get("sender")?.trim() || "";
  const cellIndex = Number(url.searchParams.get("cell"));
  const roundId = normalizeRoundId(url.searchParams.get("round"));
  const configured = Boolean(
    publicEnv.stacksContractAddress && publicEnv.stacksContractName
  );

  if (!configured) {
    return NextResponse.json({ configured: false, roundId, cellIndex, hasBoosted: false });
  }

  if (
    !sender.startsWith("S") ||
    !Number.isInteger(cellIndex) ||
    cellIndex < 0 ||
    cellIndex >= CELL_COUNT
  ) {
    return NextResponse.json({ error: "Invalid player or cell." }, { status: 400 });
  }

  try {
    const response = await fetchCallReadOnlyFunction({
      contractAddress: publicEnv.stacksContractAddress,
      contractName: publicEnv.stacksContractName,
      functionName: "has-boosted",
      functionArgs: [Cl.uint(roundId), Cl.uint(cellIndex), Cl.principal(sender)],
      senderAddress: sender,
      network: publicEnv.stacksNetwork,
      client: { baseUrl: getStacksApiUrl() }
    });

    return NextResponse.json(
      {
        configured: true,
        roundId,
        cellIndex,
        hasBoosted: extractBool(cvToJSON(response))
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not check boost status." },
      { status: 502 }
    );
  }
}
