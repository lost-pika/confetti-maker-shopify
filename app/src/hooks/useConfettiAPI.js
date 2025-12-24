// src/hooks/useConfettiAPI.js
import { getApiBasePath } from "../utils/apiBase";

export const useConfettiAPI = () => {
  const base = typeof window !== "undefined" ? getApiBasePath() : "";

  const activateConfetti = async (confettiConfig, triggerEvent) => {
    console.log("CALL activateConfetti", { confettiConfig, triggerEvent });
    const res = await fetch(`${base}/api/confetti/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  confettiId: confettiConfig.id,
  config: {
    ...confettiConfig,
    type: confettiConfig.type || "confetti", // ✅ FIX
  },
  triggerEvent,
}),

    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const deactivateConfetti = async (confettiId) => {
    console.log("CALL deactivateConfetti", { confettiId });
    const res = await fetch(`${base}/api/confetti/deactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confettiId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  return { activateConfetti, deactivateConfetti };
};
