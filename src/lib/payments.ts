export function getEventPriceUSD(eventId: string): number {
  // Ajusta el precio según el evento
  if (eventId === "fyf-open-001") return 5;
  return 5;
}

export function sanitizeNickname(n: string) {
  return (n || "").trim().slice(0, 32);
}
