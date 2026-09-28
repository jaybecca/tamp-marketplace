import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { serverEnv } from "@/server/lib/env";

export async function GET() {
  const database = await db.health();
  const ready = database.configured || serverEnv.nodeEnv !== "production";

  return NextResponse.json(
    {
      status: ready ? "ok" : "not_ready",
      service: "tamp-marketplace",
      version: "1.0.11",
      database,
      environment: serverEnv.nodeEnv,
      timestamp: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 },
  );
}
