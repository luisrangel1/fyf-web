"use client";
import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-red-50">
      <h1 className="text-3xl font-bold text-red-700">❌ Pago cancelado</h1>
      <p className="mt-4 text-lg text-gray-700">
        Tu pago fue cancelado. Si fue un error, puedes intentarlo nuevamente.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Volver al inicio
      </Link>
    </main>
  );
}


