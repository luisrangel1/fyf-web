import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEventPriceUSD, sanitizeNickname } from "@/lib/payments";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Inicializa Stripe solo si hay clave (evita fallos en build)
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET_KEY || !stripe) {
    console.error("❌ Falta STRIPE_SECRET_KEY");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  if (!BASE_URL) {
    console.error("❌ Falta NEXT_PUBLIC_BASE_URL");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const {
      eventId,
      nickname,
      wallet,
    }: { eventId?: string; nickname?: string; wallet?: string | null } = await req.json();

    if (!eventId || !nickname) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const amountUSD = getEventPriceUSD(eventId);           // asegúrate que devuelva 1.5 para "fyf-open-001"
    const unitAmount = Math.max(0, Math.round(amountUSD * 100)); // en centavos, sin floats
    const sanitizedNick = sanitizeNickname(nickname);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Inscripción ${eventId}`,
              description: `Jugador: ${sanitizedNick}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/success`,
      cancel_url: `${BASE_URL}/cancel`,
      metadata: {
        eventId,
        nickname: sanitizedNick,
        wallet: wallet ?? "N/A",
      },
    });

    if (!session.url) {
      console.error("⚠️ Stripe creó la sesión pero no devolvió URL", { sessionId: session.id });
      return NextResponse.json({ error: "No se pudo generar URL de pago" }, { status: 500 });
    }

    // ✅ Flujo URL directo (sin Stripe.js en el cliente)
    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("❌ Error creando sesión de Stripe:", err);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}



