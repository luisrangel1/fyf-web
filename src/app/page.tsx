"use client";
import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase"; // ✅ Import corregido
import { collection, query, where, onSnapshot } from "firebase/firestore";

/* ----------------------- Tipos ----------------------- */
type EventItem = {
  id: string;
  title: string;
  dateISO: string;
  mode: "Solo" | "Dúos" | "Escuadra" | "Custom";
  prize: string;
  entry: string;
  region: string;
  rules?: string;
  registerUrl?: string;
};

/* ----------------------- Datos ----------------------- */
const EVENTS: EventItem[] = [
  {
    id: "fyf-br-001",
    title: "Apertura FYF – BR Modo",
    dateISO: "2025-09-16",
    mode: "Solo",
    prize: "1 USD en FYF por cada kill",
    entry: "15 FYF",
    region: "Global",
    rules: "Máx. 20 jugadores. BR clásico.",
  },
];

/* ----------------------- Página ----------------------- */
export default function Page() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [showEvents, setShowEvents] = useState(true);

  const TOKEN_NAME = "FireYouFire";
  const TOKEN_SYMBOL = "FYF";
  const TOKEN_ADDRESS = "0x126b8d8641fb27c312dffdc2c03bbd1e95bd25ae";
  const PANCAKE_SWAP_LINK = `https://pancakeswap.finance/swap?outputCurrency=${TOKEN_ADDRESS}`;

  const { upcoming } = useMemo(() => {
    const today = new Date();
    const sorted = [...EVENTS].sort(
      (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    );
    const up = sorted.filter(
      (e) => new Date(e.dateISO) >= new Date(today.toDateString())
    );
    return { upcoming: up };
  }, []);

  // Conectar MetaMask
  const connectWallet = async () => {
    const ethWindow = window as typeof window & {
      ethereum?: {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
    };

    if (!ethWindow.ethereum) {
      alert("Instala MetaMask para conectar tu wallet");
      return;
    }

    try {
      const accounts = (await ethWindow.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      setWallet(accounts[0]);
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar la wallet");
    }
  };

  // Registrar jugador en Firebase
  const registerPlayer = async (nickname: string, eventId: string, txHash: string) => {
    try {
      const callable = httpsCallable(functions, "registerPlayer");
      const res = await callable({ wallet, nickname, eventId, txHash });
      alert("✅ Registro exitoso en Firebase");
      console.log("Respuesta:", res);
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo registrar en Firebase");
    }
  };

  return (
    <main className="min-h-screen pb-16 bg-black text-white">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-600 grid place-items-center shadow-lg">
            <span className="font-black">FYF</span>
          </div>
          <div>
            <div className="text-lg font-bold">
              {TOKEN_NAME} <span className="text-red-500">({TOKEN_SYMBOL})</span>
            </div>
            <div className="text-xs text-neutral-300">Play • Earn • Fire</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEvents(!showEvents)}
            className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 text-sm"
          >
            {showEvents ? "Ocultar eventos" : "Ver eventos"}
          </button>
          <button
            onClick={wallet ? undefined : connectWallet}
            className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 shadow"
          >
            {wallet ? wallet.slice(0, 6) + "…" + wallet.slice(-4) : "Conectar Wallet"}
          </button>
        </div>
      </header>

      {/* Registro de jugador */}
      <section className="max-w-6xl mx-auto px-4 mt-6">
        <div className="rounded-2xl p-6 shadow-lg border border-neutral-800 bg-white/5">
          <h2 className="text-xl font-extrabold mb-3">Registro de jugador</h2>
          {wallet ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const nickname = (e.currentTarget.elements.namedItem(
                  "nickname"
                ) as HTMLInputElement).value;
                const txHash = "0x-demo-hash"; // Aquí debería ir el hash real del pago
                registerPlayer(nickname, "fyf-br-001", txHash);
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                name="nickname"
                placeholder="Tu nick en COD Mobile"
                className="px-4 py-2 rounded-lg text-black"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 font-bold"
              >
                Registrar
              </button>
            </form>
          ) : (
            <p className="text-neutral-400">Conecta tu wallet para registrarte.</p>
          )}
        </div>
      </section>
    </main>
  );
}
