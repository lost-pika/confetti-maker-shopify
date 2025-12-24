export function getApiBasePath() {
  if (typeof window === "undefined") return "";
  // Trim after `/apps/confetti-maker/app`
  const match = window.location.pathname.match(/^(.*\/apps\/confetti-maker\/app)/);
  return match ? match[1] : "";
}
