"use client";
import { useEffect, useState } from "react";

type LastReg = { eventId: string; nickname: string; wallet: string };

export default function SuccessPage() {
  const [status, setStatus] = useState("⏳ Registrando tu pago...");

  useEffect(() => {
    const run = async () => {
      try {
        const raw = localStorage.getItem("lastReg");
        if (!raw) {
          setStatus("⚠️ No encontré datos del pago en este navegador.");
          return;
        }
        const last = JSON.parse(raw) as LastReg;

        const res = await fetch("/api/register-paid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: last.eventId,
            nickname: last.nickname,
            wallet: last.wallet,
            txId: "stripe-session",
            method: "stripe" as const,
            amountUSD: 1.5,
            payerEmail: "N/A",
          }),
        });

        if (res.ok) {
          setStatus("✅ Pago confirmado y guardado. ¡Nos vemos en el torneo!");
          localStorage.removeItem("lastReg");
        } else {
          setStatus("⚠️ Pago ok, pero no pude guardar tu registro.");
        }
      } catch {
        setStatus("⚠️ Error registrando el pago.");
      }
    };
    void run();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <h1 className="text-3xl font-bold text-green-700">✅ Pago completado</h1>
      <p className="mt-4 text-lg text-gray-700">{status}</p>
      <a href="/" className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        Volver al inicio
      </a>
    </main>
  );
}

