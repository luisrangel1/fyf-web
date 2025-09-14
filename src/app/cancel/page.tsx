"use client";
import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-red-600">❌ Pago cancelado</h1>
      <p className="mt-4">Tu pago fue cancelado. Puedes intentarlo de nuevo.</p>
      <Link
        href="/"
        className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Volver al inicio
      </Link>
    </main>
  );
}

