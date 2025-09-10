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

/* ----------------------- Tipado Ethereum ----------------------- */
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
  {
    id: "fyf-duos-002",
    title: "Dúos Tácticos – Edición FYF",
    dateISO: "2025-10-05",
    mode: "Dúos",
    prize: "Skins + 5,000 FYF",
    entry: "5 FYF",
    region: "Global",
    rules: "MP rankeado, límite de 2 dispositivos por equipo.",
    registerUrl: "https://t.me/+B7QvutUIkGVhNmUx",
  },
  {
    id: "fyf-solo-003",
    title: "Solo Snipers Night",
    dateISO: "2025-10-12",
    mode: "Solo",
    prize: "Top 3: 3,000 / 1,500 / 500 FYF",
    entry: "Gratis",
    region: "LATAM",
    rules: "Sólo francotiradores, sin perks explosivos.",
  },
];

/* ----------------------- Página ----------------------- */
export default function Page() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [showEvents, setShowEvents] = useState(true);

  // Configuración básica
  const TOKEN_NAME = "FireYouFire";
  const TOKEN_SYMBOL = "FYF";
  const TOKEN_ADDRESS = "0x126b8d8641fb27c312dffdc2c03bbd1e95bd25ae";
  const PANCAKE_SWAP_LINK = `https://pancakeswap.finance/swap?outputCurrency=${TOKEN_ADDRESS}`;

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
    } catch (e) {
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

      {/* Compra rápida */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="rounded-2xl p-6 shadow-lg border border-neutral-800 bg-white/5">
          <h2 className="text-2xl font-extrabold mb-2">Compra rápida</h2>
          <p className="text-neutral-300">Compra el token en PancakeSwap:</p>
          <a
            href={PANCAKE_SWAP_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 px-5 py-3 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200"
          >
            💱 PancakeSwap
          </a>
        </div>
      </section>

      {/* Eventos */}
      {showEvents && (
        <section className="max-w-6xl mx-auto px-4 mt-10">
          <h2 className="text-2xl font-extrabold">Eventos & Torneos – COD Mobile</h2>
          <div className="mt-5">
            <h3 className="text-lg font-bold text-green-400">Próximos</h3>
            {upcoming.length === 0 ? (
              <p className="text-neutral-400 mt-2">No hay torneos próximos.</p>
            ) : (
              <div className="mt-3 grid md:grid-cols-2 gap-4">
                {upcoming.map((ev) => (
                  <EventCard key={ev.id} ev={ev} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

/* ----------------------- Componentes ----------------------- */
function EventCard({ ev }: { ev: EventItem }) {
  const date = new Date(ev.dateISO);
  const pretty = date.toLocaleDateString();

  return (
    <article className="rounded-2xl p-5 border shadow-lg border-red-800/40 bg-gradient-to-br from-red-900/20 to-black">
      <h4 className="text-lg font-bold">{ev.title}</h4>
      <p className="text-sm text-neutral-400">{pretty} • {ev.region}</p>
      <p className="mt-2 text-sm">Premio: {ev.prize}</p>
      <p className="text-sm">Entrada: {ev.entry}</p>
      {ev.rules && <p className="mt-2 text-xs text-neutral-400">{ev.rules}</p>}
      {ev.registerUrl && (
        <a
          href={ev.registerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 px-4 py-2 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-300"
        >
          Registrarme
        </a>
      )}
    </article>
  );
}

