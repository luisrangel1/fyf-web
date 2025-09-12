import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { getEventPriceUSD, sanitizeNickname } from "@/src/lib/payments";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    const { eventId, nickname, wallet } = await req.json();
    if (!eventId || !nickname) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const price = getEventPriceUSD(eventId);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(price * 100),
            product_data: {
              name: `Inscripción ${eventId}`,
              description: `Registro: ${sanitizeNickname(nickname)}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?paid=stripe&eventId=${eventId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?cancelled=stripe`,
      metadata: { eventId, nickname: sanitizeNickname(nickname), wallet: wallet || "" },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
