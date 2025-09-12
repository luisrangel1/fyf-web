export function getEventPriceUSD(eventId: string): number {
  // De momento, todos los eventos cuestan 5 USD
  return 5;
}

export function sanitizeNickname(nickname: string): string {
  return nickname.replace(/[^a-zA-Z0-9_\-]/g, "").slice(0, 20);
}
