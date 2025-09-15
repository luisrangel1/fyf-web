import { NextRequest, NextResponse } from "next/server";
import { addRegistration } from "@/lib/registrationsStore";

type Method = "stripe" | "fyf";

interface PaidBody {
  eventId: string;
  nickname: string;
  wallet?: string;
  txId?: string;
  method: Method;
  amountUSD: number;
  payerEmail?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PaidBody;
    const eventId = body.eventId?.trim() || "fyf-open-001";
    const nickname = body.nickname?.trim() || "";
    const method = body.method;
    const amountUSD = Number(body.amountUSD);

    if (!nickname || !method || Number.isNaN(amountUSD)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    if (method !== "stripe" && method !== "fyf") {
      return NextResponse.json({ error: "Método inválido" }, { status: 400 });
    }

    const result = addRegistration(eventId, {
      eventId,
      nickname,
      method,
      wallet: body.wallet?.trim() || "N/A",
      txId: body.txId?.trim() || "N/A",
      amountUSD,
      payerEmail: body.payerEmail?.trim() || "N/A",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("❌ register-paid error:", e);
    return NextResponse.json({ error: "No se pudo registrar pago" }, { status: 500 });
  }
}
