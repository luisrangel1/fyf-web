export function getEventPriceUSD(eventId: string): number {
  if (eventId === "fyf-open-001") return 1.5; // 🔥 Evento actual: 1.5 USD
  return 5; // fallback por si algún día tienes otro evento
}

export function sanitizeNickname(nickname: string): string {
  return nickname.replace(/[^a-zA-Z0-9_\- ]/g, "").slice(0, 20);
}
