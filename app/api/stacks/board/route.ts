import { NextResponse } from "next/server";
import { Cl, cvToJSON, fetchCallReadOnlyFunction } from "@stacks/transactions";
import { getStacksApiUrl, publicEnv } from "@/lib/env";
import { CELL_COUNT, normalizeRoundId } from "@/lib/patchrush";
import {
  extractUint,
  mapStacksCell,
  type StacksContractRef
} from "@/lib/stacks-cell-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getConfiguredContract(): StacksContractRef | null {
  if (!publicEnv.stacksContractAddress || !publicEnv.stacksContractName) {
    return null;
  }

  return {
    address: publicEnv.stacksContractAddress,
    name: publicEnv.stacksContractName
  };
}

function normalizeSenderAddress(value: string | null, fallback: string) {
  const sender = value?.trim();
  return sender && sender.startsWith("S") ? sender : fallback;
}

function getReadOnlyOptions(contract: StacksContractRef, senderAddress: string) {
  return {
    contractAddress: contract.address,
    contractName: contract.name,
    senderAddress,
    network: publicEnv.stacksNetwork,
    client: {
      baseUrl: getStacksApiUrl()
    }
  };
}

export async function GET(request: Request) {
  const contract = getConfiguredContract();
  const url = new URL(request.url);
  const roundId = normalizeRoundId(url.searchParams.get("round"));

  if (!contract) {
    return NextResponse.json(
      {
        configured: false,
        roundId,
        cells: [],
        claimedCount: 0,
        source: getStacksApiUrl()
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const senderAddress = normalizeSenderAddress(
    url.searchParams.get("sender"),
    contract.address
  );

  try {
    const readOnlyOptions = getReadOnlyOptions(contract, senderAddress);
    const requestedSender = url.searchParams.get("sender")?.trim() || "";
    const hasPlayer = requestedSender.startsWith("S");
    const [claimedResponse, cells, playerScoreResponse, claimCountResponse] =
      await Promise.all([
        fetchCallReadOnlyFunction({
          ...readOnlyOptions,
          functionName: "get-round-claimed-count",
          functionArgs: [Cl.uint(roundId)]
        }),
        Promise.all(
          Array.from({ length: CELL_COUNT }, async (_, index) => {
            const response = await fetchCallReadOnlyFunction({
              ...readOnlyOptions,
              functionName: "get-cell",
              functionArgs: [Cl.uint(roundId), Cl.uint(index)]
            });
            return mapStacksCell(cvToJSON(response), index, roundId);
          })
        ),
        hasPlayer
          ? fetchCallReadOnlyFunction({
              ...readOnlyOptions,
              functionName: "get-player-score",
              functionArgs: [Cl.uint(roundId), Cl.principal(requestedSender)]
            })
          : Promise.resolve(null),
        hasPlayer
          ? fetchCallReadOnlyFunction({
              ...readOnlyOptions,
              functionName: "get-claim-count",
              functionArgs: [Cl.uint(roundId), Cl.principal(requestedSender)]
            })
          : Promise.resolve(null)
      ]);
    const claimedCount = extractUint(cvToJSON(claimedResponse));
    const claimsUsed = claimCountResponse ? extractUint(cvToJSON(claimCountResponse)) : 0;

    return NextResponse.json(
      {
        configured: true,
        roundId,
        claimedCount,
        cells: cells.filter((cell) => Boolean(cell)),
        player: hasPlayer
          ? {
              score: playerScoreResponse
                ? extractUint(cvToJSON(playerScoreResponse))
                : 0,
              claimsUsed,
              claimsRemaining: Math.max(0, 3 - claimsUsed)
            }
          : null,
        source: getStacksApiUrl(),
        checkedAt: new Date().toISOString()
      },
      {
        headers: {
          "Cache-Control": "s-maxage=10, stale-while-revalidate=30"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        roundId,
        cells: [],
        source: getStacksApiUrl(),
        error:
          error instanceof Error ? error.message : "Could not load Stacks board."
      },
      { status: 502 }
    );
  }
}
