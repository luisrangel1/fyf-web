import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sanitizeNickname } from "@/lib/payments";

// Inicializa Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { nickname, wallet } = await req.json();

    if (!nickname) {
      return NextResponse.json(
        { error: "Falta el nickname" },
        { status: 400 }
      );
    }

    const sanitizedNick = sanitizeNickname(nickname);

    // ⚡ Evento fijo: FireYouFire Open #1 – COD Mobile
    const amountUSD = 1.5;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Inscripción FireYouFire Open #1 – COD Mobile",
              description: `Jugador: ${sanitizedNick}`,
            },
            unit_amount: Math.round(amountUSD * 100), // Stripe trabaja en centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        eventId: "fyf-open-001",
        nickname: sanitizedNick,
        wallet: wallet || "N/A",
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (err) {
    console.error("❌ Error creando sesión de Stripe:", err);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}

