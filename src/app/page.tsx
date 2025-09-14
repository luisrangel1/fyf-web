"use client";
import { useMemo, useState } from "react";
import { ethers } from "ethers";

type EventItem = {
  id: string;
  title: string;
  dateISO: string;
  mode: string;
  prize: string;
  entryUSD: number;
  region: string;
};

const EVENTS: EventItem[] = [
  {
    id: "fyf-open-001",
    title: "FireYouFire Open #1 – COD Mobile",
    dateISO: "2025-09-21T22:00:00-04:00", // domingo 21 sept 10pm VE
    mode: "Battle Royale Individual",
    prize: "1 USD por kill",
    entryUSD: 1.5,
    region: "Global",
  },
];

const TOKEN_NAME = "FireYouFire";
const TOKEN_SYMBOL = "FYF";
const TOKEN_ADDRESS = "0x126b8d8641fb27c312dffdc2c03bbd1e95bd25ae";
const RECIPIENT = "0x290117a497f83aA436Eeca928b4a8Fa3857ed829";
const AMOUNT_FYF = "15";

interface EthereumWindow extends Window {
  ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
}

export default function Page() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [eventId] = useState("fyf-open-001");
  const [nickname, setNickname] = useState("");

  const { current } = useMemo(() => {
    const today = new Date();
    const sorted = [...EVENTS].sort(
      (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    );
    const up =
      sorted.find((e) => new Date(e.dateISO) >= new Date(today.toDateString())) ||
      sorted[0];
    return { current: up };
  }, []);

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

  async function payWithFYF() {
    if (!nickname.trim()) {
      alert("Por favor ingresa tu nick de COD Mobile");
      return;
    }

    try {
      const ethWindow = window as unknown as EthereumWindow;
      if (!ethWindow.ethereum) {
        alert("Instala MetaMask para continuar");
        return;
      }

      const provider = new ethers.BrowserProvider(ethWindow.ethereum);
      const signer = await provider.getSigner();

      const abi = [
        "function transfer(address to, uint amount) returns (bool)",
        "function decimals() view returns (uint8)",
      ];
      const token = new ethers.Contract(TOKEN_ADDRESS, abi, signer);
      const decimals = await token.decimals();
      const amount = ethers.parseUnits(AMOUNT_FYF, decimals);

      const tx = await token.transfer(RECIPIENT, amount);
      await tx.wait();
      alert(`✅ Pago FYF enviado. Tx: ${tx.hash}. Nick: ${nickname}`);
    } catch (err) {
      console.error(err);
      alert("❌ Error al enviar el pago FYF");
    }
  }

  async function payWithStripe() {
    if (!nickname.trim()) {
      alert("Por favor ingresa tu nick de COD Mobile");
      return;
    }

    const res = await fetch("/api/payments/stripe/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, nickname, wallet }),
    });

    const data = await res.json();
    if (data?.id) {
      const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
      await stripe.redirectToCheckout({ sessionId: data.id });
    } else {
      alert("No se pudo iniciar Stripe");
    }
  }

  return (
    <main className="min-h-screen pb-16 bg-black text-white">
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
            onClick={wallet ? undefined : connectWallet}
            className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 shadow text-sm"
          >
            {wallet ? wallet.slice(0, 6) + "…" + wallet.slice(-4) : "Conectar Wallet"}
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 mt-6">
        <div className="rounded-2xl p-6 shadow-lg border border-neutral-800 bg-white/5">
          <h2 className="text-xl font-extrabold mb-3">Registro de jugador</h2>
          <p className="text-neutral-300 mb-3">
            Evento: <b>{current.title}</b> · Inscripción ${current.entryUSD} USD
          </p>

          {/* Input Nickname */}
          <input
            type="text"
            placeholder="Tu nick en COD Mobile"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={payWithFYF}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-bold"
            >
              🔥 Pagar con FYF (MetaMask)
            </button>
            <button
              onClick={payWithStripe}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold"
            >
              🌎 Pagar con tarjeta (Stripe)
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}


