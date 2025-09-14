import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEventPriceUSD, sanitizeNickname } from "@/lib/payments";

// Inicializa Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { eventId, nickname, wallet } = await req.json();

    // Calcula el precio en USD desde tu helper
    const amountUSD = getEventPriceUSD(eventId);
    const sanitizedNick = sanitizeNickname(nickname);

    // Crea la sesión de Stripe Checkout
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
            unit_amount: amountUSD * 100, // Stripe trabaja en centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // 👇 Redirecciones a tu dominio en Vercel
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
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
