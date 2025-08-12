// In-memory challenge store (shared between endpoints)
export const challenges: Record<string, { nonce: string; created: string }> =
  {};
