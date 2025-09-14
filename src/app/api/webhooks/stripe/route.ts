import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { appendToSheet } from "@/lib/sheets";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Falta stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: unknown) {
    console.error("❌ Error verificando firma de Stripe:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

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

      console.log("✅ Registro guardado en Google Sheets:", {
        nickname,
        eventId,
        amount: session.amount_total,
      });
    } catch (err: unknown) {
      console.error("❌ Error guardando en Google Sheets:", err);
    }
  } else {
    console.log(`ℹ️ Evento recibido de Stripe: ${event.type} (ignorado)`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
