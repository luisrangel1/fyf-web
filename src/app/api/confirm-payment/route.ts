import { NextResponse } from "next/server";
import { appendToSheet } from "@/lib/sheets";

export async function POST() {
  try {
    // 📌 Registro temporal de prueba en Google Sheets
    await appendToSheet({
      createdAtISO: new Date().toISOString(),
      eventId: "fyf-open-001",
      method: "stripe",
      nickname: "Desconocido", // Luego lo reemplazaremos con el nick real
      wallet: "N/A",
      txId: "stripe-success", // Valor fijo de prueba
      amount: "5", // USD fijo (lo ajustaremos luego)
      payerEmail: "usuario@ejemplo.com", // Placeholder
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Error confirm-payment:", err);
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }
}
