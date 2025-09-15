import { NextRequest, NextResponse } from "next/server";
import { addRegistration, freeSlotsLeft } from "@/lib/registrationsStore";

interface FreeBody {
  eventId: string;
  nickname: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FreeBody;
    const eventId = body.eventId?.trim() || "fyf-open-001";
    const nickname = body.nickname?.trim() || "";

    if (!nickname) {
      return NextResponse.json({ error: "Falta el nick" }, { status: 400 });
    }

    if (freeSlotsLeft(eventId, 15) <= 0) {
      return NextResponse.json({ error: "Se agotaron los 15 cupos gratis" }, { status: 400 });
    }

    const result = addRegistration(eventId, {
      eventId,
      nickname,
      method: "free",
      wallet: "N/A",
      txId: "free-pass",
      amountUSD: 0,
      payerEmail: "N/A",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("❌ register-free error:", e);
    return NextResponse.json({ error: "No se pudo registrar gratis" }, { status: 500 });
  }
}
