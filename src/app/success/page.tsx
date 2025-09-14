"use client";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [status, setStatus] = useState("⏳ Registrando tu pago...");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Llama a tu API para registrar el pago en Google Sheets
        const res = await fetch("/api/confirm-payment", { method: "POST" });
        if (!res.ok) throw new Error("Error en el registro");

        setStatus("✅ Pago confirmado y guardado en el sistema 🎮🔥");
      } catch (err) {
        console.error("❌ Error registrando el pago:", err);
        setStatus("⚠️ El pago se completó, pero no se pudo guardar. Contacta soporte.");
      }
    };

    confirmPayment();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <h1 className="text-3xl font-bold text-green-700">✅ Pago completado</h1>
      <p className="mt-4 text-lg text-gray-700">{status}</p>
      <a
        href="/"
        className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Volver al inicio
      </a>
    </main>
  );
}
