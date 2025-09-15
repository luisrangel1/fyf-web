// Registro tipado y store temporal en memoria del servidor.
export type Method = "free" | "stripe" | "fyf";

export interface Registration {
  eventId: string;
  nickname: string;
  method: Method;
  wallet: string;
  txId: string;
  amountUSD: number;
  payerEmail: string;
  createdAtISO: string;
}

type Store = Record<string, Registration[]>;

// ⚠️ En serverless es temporal. Útil para el evento inmediato.
const store: Store = {};

function getList(eventId: string): Registration[] {
  return store[eventId] ?? [];
}

export function listRegistrations(eventId: string): Registration[] {
  return [...getList(eventId)]; // copia defensiva
}

export function freeSlotsLeft(eventId: string, limit = 15): number {
  const freeCount = getList(eventId).filter(r => r.method === "free").length;
  const remaining = limit - freeCount;
  return remaining > 0 ? remaining : 0;
}

export function isNicknameTaken(eventId: string, nickname: string): boolean {
  const lc = nickname.trim().toLowerCase();
  return getList(eventId).some(r => r.nickname.trim().toLowerCase() === lc);
}

export function addRegistration(
  eventId: string,
  input: Omit<Registration, "createdAtISO">
): { ok: true } | { ok: false; reason: string } {
  const nick = input.nickname.trim();
  if (!nick) return { ok: false, reason: "Nickname vacío" };

  if (isNicknameTaken(eventId, nick)) {
    return { ok: false, reason: "Este nick ya está inscrito en el evento" };
  }

  const now: Registration = { ...input, nickname: nick, createdAtISO: new Date().toISOString() };

  if (!store[eventId]) store[eventId] = [];
  store[eventId].push(now);
  return { ok: true };
}
