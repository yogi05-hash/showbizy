// 8-character code using a Crockford-style alphabet (no 0/O/1/I to avoid confusion).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateReferralCode(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return out
}

// Both referrer and new user receive this many bonus days of Pro.
export const REFERRAL_REWARD_DAYS = 30
