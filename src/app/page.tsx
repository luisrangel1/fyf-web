"use client";
import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { registerPlayerOnCall } from "../lib/firebaseClient"; // 👈 importamos helper

/* ----------------------- Tipos ----------------------- */
type EventItem = {
  id: string;
  title: string;
  dateISO: string; // YYYY-MM-DD
  mode: string;
  prize: string;
  entry: string;
  region: string;
  rules?: string;
  registerUrl?: string;
};

type RegisterResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

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

/* ----------------------- Configuración del token ----------------------- */
const TOKEN_NAME = "FireYouFire";
const TOKEN_SYMBOL = "FYF";
const TOKEN_ADDRESS = "0x126b8d8641fb27c312dffdc2c03bbd1e95bd25ae"; // contrato FYF
const RECIPIENT = "0x290117a497f83aA436Eeca928b4a8Fa3857ed829"; // ✅ tu wallet
const AMOUNT = "15"; // entrada en FYF

/* ----------------------- Función de pago ----------------------- */
async function payEntry() {
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
    const amount = ethers.parseUnits(AMOUNT, decimals);

    const tx = await token.transfer(RECIPIENT, amount);
    await tx.wait();

    alert(
      `✅ Pago enviado.\n\nCopia este ID de transacción: ${tx.hash}\n\n📩 Ahora envíalo junto con tu nick de COD Mobile al grupo de Telegram del evento.`
    );
  } catch (err) {
    console.error(err);
    alert("❌ Error al enviar el pago");
  }
}

/* ----------------------- Página ----------------------- */
export default function Page() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [showEvents] = useState(true);

  // Separar próximos eventos
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
          <a
            href="https://pancakeswap.finance/swap?outputCurrency=0x126b8d8641fb27c312dffdc2c03bbd1e95bd25ae&chain=bsc"
            target="_blank"
            className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 shadow text-sm font-bold"
          >
            🛒 Comprar FYF
          </a>
          <button
            onClick={wallet ? undefined : connectWallet}
            className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 shadow text-sm"
          >
            {wallet
              ? wallet.slice(0, 6) + "…" + wallet.slice(-4)
              : "Conectar Wallet"}
          </button>
        </div>
      </header>

      {/* Registro de jugador */}
      <section className="max-w-6xl mx-auto px-4 mt-6">
        <div className="rounded-2xl p-6 shadow-lg border border-neutral-800 bg-white/5">
          <h2 className="text-xl font-extrabold mb-3">Registro de jugador</h2>
          {wallet ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const nickname = (
                  e.currentTarget.elements.namedItem(
                    "nickname"
                  ) as HTMLInputElement
                ).value;

                try {
                  const txHash = prompt("👉 Ingresa el ID de la transacción de MetaMask:");
                  if (!txHash) {
                    alert("Debes ingresar un hash válido");
                    return;
                  }

                  const result: RegisterResponse = await registerPlayerOnCall({
                    wallet,
                    nickname,
                    eventId: "fyf-open-001", // 👈 aquí defines el evento
                    txHash,
                  });

                  if (result.success) {
                    alert(`✅ Registrado: ${nickname} con wallet ${wallet}`);
                  } else {
                    alert(`❌ Error: ${result.error || "Error desconocido"}`);
                  }
                } catch (err) {
                  console.error(err);
                  alert("❌ No se pudo registrar el jugador");
                }
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

      {/* Eventos de prueba */}
      {showEvents && (
        <section className="max-w-6xl mx-auto px-4 mt-6">
          <h2 className="text-xl font-extrabold mb-3">Eventos</h2>
          {upcoming.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl p-4 mb-4 shadow border border-neutral-800 bg-white/5"
            >
              <h3 className="font-bold">{event.title}</h3>
              <p>📅 {event.dateISO}</p>
              <p>🎮 {event.mode}</p>
              <p>💰 Entrada: {event.entry}</p>
              <p>🏆 Premio: {event.prize}</p>
              {event.registerUrl && (
                <a
                  href={event.registerUrl}
                  target="_blank"
                  className="text-blue-400 underline"
                >
                  Ir al enlace de registro
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 🚀 Evento especial del 16/09 */}
      <section className="max-w-6xl mx-auto px-4 mt-6">
        <div className="rounded-2xl p-6 shadow-lg border border-neutral-800 bg-white/5">
          <h2 className="text-xl font-extrabold mb-3">
            FYF Open Especial – Battle Royale (16 de Septiembre)
          </h2>
          <p className="mb-2">🎮 Modo: Battle Royale</p>
          <p className="mb-2">💰 Entrada: 15 FYF</p>
          <p className="mb-2">🏆 Premio: 1 USD en FYF por cada kill</p>
          <p className="mb-4 text-sm text-neutral-300">
            Los jugadores pagan <strong>15 FYF</strong> para entrar a la sala del
            evento. Por cada kill recibirán <strong>1 USD en FYF</strong> directo
            a su wallet de MetaMask. Una vez pagada la entrada, copia el{" "}
            <strong>ID de la transacción</strong> y envíalo con tu nick de COD
            Mobile al grupo de Telegram.
          </p>
          <button
            onClick={payEntry}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-bold"
          >
            🔥 Pagar inscripción (15 FYF)
          </button>
          <div className="mt-3">
            <a
              href={`https://metamask.app.link/send/${TOKEN_ADDRESS}?address=${RECIPIENT}&value=${AMOUNT}`}
              target="_blank"
              className="text-blue-400 underline"
            >
              👉 Pagar directo desde MetaMask
            </a>
          </div>
          <div className="mt-3">
            <a
              href="https://t.me/+B7QvutUIkGVhNmUx"
              target="_blank"
              className="text-blue-400 underline"
            >
              📩 Enviar ID de pago y tu nick en Telegram
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

