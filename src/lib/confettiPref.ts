// Confetti preference, per user, stored on-device. Default: on.
export function confettiKey(userId?: string) {
  return `sobre-confetti:${userId ?? "anon"}`;
}

export function confettiEnabled(userId?: string) {
  return localStorage.getItem(confettiKey(userId)) !== "0";
}

export function setConfettiEnabled(userId: string | undefined, on: boolean) {
  localStorage.setItem(confettiKey(userId), on ? "1" : "0");
}
