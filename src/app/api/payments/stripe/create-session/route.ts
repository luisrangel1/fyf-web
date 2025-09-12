import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEventPriceUSD, sanitizeNickname } from "@/lib/payments";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    const { eventId, nickname, wallet } = await req.json();

    const amountUSD = getEventPriceUSD(eventId);
    const sanitizedNick = sanitizeNickname(nickname);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Inscripción ${eventId}`,
              description: `Jugador: ${sanitizedNick}`,
            },
            unit_amount: amountUSD * 100, // en centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?canceled=true`,
      metadata: {
        eventId,
        nickname: sanitizedNick,
        wallet: wallet || "N/A",
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (err: unknown) {
    console.error("❌ Error creando sesión de Stripe:", err);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
