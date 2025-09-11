"use client";
import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "./firebase"; // Asegúrate de tener tu firebase.ts
import { collection, query, where, onSnapshot } from "firebase/firestore";

/* ----------------------- Tipos ----------------------- */
type EventItem = {
  id: string;
  title: string;
  dateISO: string;
  mode: string;
  prize: string;
  entry: string;
  region: string;
  rules?: string;
  registerUrl?: string;
};

interface EthereumWindow extends Window {
  ethereum?: any;
}

/* ----------------------- Eventos ----------------------- */
const EVENTS: EventItem[] = [
  {
    id: "fyf-br-apertura",
    title: "🔥 Apertura FYF – Battle Royale",
    dateISO: "2025-03-16",
    mode: "BR (20 jugadores)",
    prize: "1 USD en FYF por cada kill",
    entry: "15 FYF",
    region: "Global",
    rules: "Solo 20 participantes, 1 cuenta por jugador.",
  },
];

/* ----------------------- Página ----------------------- */
export default function Page() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [players, setPlayers] = useState<{ nickname: string; wallet: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const TOKEN_ADDRESS = "0x126b8d8641fb27c312dffdc2c03bbd1e95bd25ae";
  const TREASURY_ADDRESS = "0x290117a497f83aA436Eeca928b4a8Fa3857ed829";
  const ENTRY_FEE = "15";

  const TOKEN_ABI = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function decimals() public view returns (uint8)",
  ];

  const { upcoming } = useMemo(() => {
    const today = new Date();
    const sorted = [...EVENTS].sort(
      (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    );
    const up = sorted.filter((e) => new Date(e.dateISO) >= today);
    return { upcoming: up };
  }, []);

  // Conectar MetaMask
  const connectWallet = async () => {
    const ethWindow = window as EthereumWindow;
    if (!ethWindow.ethereum) {
      alert("Instala MetaMask");
      return;
    }
    try {
      const accounts = await ethWindow.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  // Registro y pago
  const registerAndPay = async () => {
    if (!wallet || !nickname) {
      alert("Conecta tu wallet y escribe tu nick.");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as EthereumWindow).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

      const decimals = await contract.decimals();
      const amount = ethers.parseUnits(ENTRY_FEE, decimals);

      // Enviar transacción
      const tx = await contract.transfer(TREASURY_ADDRESS, amount);
      await tx.wait();

      // Llamar a Cloud Function para verificar
      const functions = getFunctions();
      const verifyAndRegister = httpsCallable(functions, "verifyAndRegister");
      const result = await verifyAndRegister({
        txHash: tx.hash,
        nickname,
        wallet,
        eventId: "fyf-br-apertura",
      });

      alert("✅ Registro confirmado en backend: " + (result.data as any).message);
    } catch (err) {
      console.error(err);
      alert("❌ Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  // Suscripción en tiempo real a jugadores
  useMemo(() => {
    const q = query(collection(db, "registrations"), where("eventId", "==", "fyf-br-apertura"));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: { nickname: string; wallet: string }[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        list.push({ nickname: data.nickname, wallet: data.wallet });
      });
      setPlayers(list);
    });
    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen pb-16 bg-black text-white">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🔥 FireYouFire</h1>
        <button
          onClick={wallet ? undefined : connectWallet}
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
        >
          {wallet ? wallet.slice(0, 6) + "…" + wallet.slice(-4) : "Conectar Wallet"}
        </button>
      </header>

      <section className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-extrabold mb-4">Evento disponible</h2>
        {upcoming.map((ev) => (
          <div key={ev.id} className="p-4 border rounded mb-4 bg-white/10">
            <h3 className="text-xl font-bold">{ev.title}</h3>
            <p className="text-sm text-neutral-300">{ev.prize}</p>
            <p className="mt-2">Entrada: {ev.entry}</p>

            {wallet && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  registerAndPay();
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Tu nick en COD Mobile"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="px-3 py-2 rounded text-black"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-green-600 hover:bg-green-700"
                >
                  {loading ? "Procesando..." : "Registrar y pagar"}
                </button>
              </form>
            )}
          </div>
        ))}

        <h2 className="text-xl font-bold mt-6">👥 Jugadores registrados</h2>
        {players.length === 0 ? (
          <p className="text-neutral-400 mt-2">Nadie registrado aún.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {players.map((p, i) => (
              <li
                key={i}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded flex justify-between"
              >
                <span>{p.nickname}</span>
                <span className="text-xs text-neutral-400">
                  {p.wallet.slice(0, 6)}…{p.wallet.slice(-4)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
