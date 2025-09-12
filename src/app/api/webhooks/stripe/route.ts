import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { appendToSheet } from "@/lib/sheets";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Error verificando webhook:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ✅ Procesamos el evento de pago completado
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const metadata = session.metadata || {};
      const nickname = metadata.nickname || "unknown";
      const eventId = metadata.eventId || "unknown";
      const wallet = metadata.wallet || "N/A";

      await appendToSheet({
        createdAtISO: new Date().toISOString(),
        eventId,
        method: "stripe",
        nickname,
        wallet,
        txId: session.payment_intent?.toString() || "no-intent",
        amount: session.amount_total
          ? (session.amount_total / 100).toString()
          : "0",
        payerEmail: session.customer_email || "unknown",
      });

      console.log("✅ Registro guardado en Google Sheets:", nickname);
    } catch (err) {
      console.error("❌ Error guardando en Google Sheets:", err);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
