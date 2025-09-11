"use client";
import { useMemo, useState } from "react";

/* ----------------------- Tipos ----------------------- */
type EventItem = {
  id: string;
  title: string;
  dateISO: string; // YYYY-MM-DD
  mode: "Solo" | "Dúos" | "Escuadra" | "Custom";
  prize: string;
  entry: string;
  region: string;
  rules?: string;
  registerUrl?: string;
};

// Tipado para window.ethereum
interface EthereumWindow extends Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
}

/* ----------------------- Datos ----------------------- */
const EVENTS: EventItem[] = [
  {
    id: "fyf-open-001",
    title: "FYF Open #1 – COD Mobile",
    dateISO: "2025-09-28",
    mode: "Escuadra",
    prize: "$100 en FYF",
    entry: "Gratis",
    region: "LATAM",
    rules: "Partidas BR, mejor de 3. Anti-cheat estricto.",
    registerUrl: "https://t.me/+B7QvutUIkGVhNmUx",
  },
];

/* ----------------------- Página ----------------------- */
export default function Page() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [showEvents, setShowEvents] = useState(true);

  // 🔧 Configuración básica
  const TOKEN_NAME = "FireYouFire";
  const TOKEN_SYMBOL = "FYF";
  const TOKEN_ADDRESS = "0x126b8d8641fb27c312dffdc2c03bbd1e95bd25ae";

  // Separar próximos vs pasados
  const { upcoming, past } = useMemo(() => {
    const today = new Date();
    const sorted = [...EVENTS].sort(
      (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    );
    const up = sorted.filter((e) => new Date(e.dateISO) >= new Date(today.toDateString()));
    const pa = sorted.filter((e) => new Date(e.dateISO) < new Date(today.toDateString())).reverse();
    return { upcoming: up, past: pa };
  }, []);

  // Conectar MetaMask
  const connectWallet = async () => {
    const ethWindow = window as EthereumWindow;
    if (!ethWindow.ethereum) {
      alert("Instala MetaMask para conectar tu wallet");
      return;
    }
    try {
      const accounts = (await ethWindow.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      setWallet(accounts[0]);
    } catch (e: unknown) {
      console.error(e);
      alert("No se pudo conectar la wallet");
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
                const nickname = (e.currentTarget.elements.namedItem("nickname") as HTMLInputElement).value;
                alert(`Registrado: ${nickname} con wallet ${wallet}`);
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
