// src/hooks/useConfettiAPI.js
import { getApiBasePath } from "../utils/apiBase";

export const useConfettiAPI = () => {
  const base = typeof window !== "undefined" ? getApiBasePath() : "";

  const activateConfetti = async (confettiConfig, triggerEvent) => {
  const res = await fetch(`${base}/api/confetti`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "activate",
      confettiId: confettiConfig.id,
      config: confettiConfig,
      triggerEvent,
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};


  const deactivateConfetti = async (confettiId) => {
  const res = await fetch(`${base}/api/confetti`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "deactivate",
      confettiId,
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};


  return { activateConfetti, deactivateConfetti };
};
