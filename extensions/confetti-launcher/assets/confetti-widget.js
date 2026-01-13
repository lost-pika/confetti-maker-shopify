(function () {
  /* -----------------------------------------------------------
     WAIT UNTIL CONFETTI LIBRARY LOADS
  ----------------------------------------------------------- */
  function waitForConfetti(cb) {
    if (window.confetti) cb();
    else setTimeout(() => waitForConfetti(cb), 50);
  }

  /* -----------------------------------------------------------
     FIRE CONFETTI
  ----------------------------------------------------------- */
  function fireConfetti(cfg) {
    if (!cfg || !window.confetti) return;

    const base = {
      particleCount: cfg.particleCount || 150,
      spread: cfg.spread || 70,
      gravity: cfg.gravity ?? 1,
      origin: cfg.origin || { x: 0.5, y: 0.6 },
      colors: cfg.colors,
      shapes: cfg.shapes,
    };

    switch (cfg.burstType) {
      case "fireworks":
        for (let i = 0; i < 3; i++) {
          window.confetti({
            ...base,
            particleCount: Math.round(base.particleCount / 3),
            startVelocity: 50,
            ticks: 250,
            origin: {
              x: 0.2 + 0.3 * i,
              y: Math.random() * 0.4 + 0.1,
            },
          });
        }
        break;

      case "snow":
        window.confetti({
          ...base,
          particleCount: base.particleCount ?? 250,
          spread: 160,
          gravity: 0.3,
          startVelocity: 10,
          ticks: 400,
        });
        break;

      case "pride":
        window.confetti({
          ...base,
          spread: 120,
          startVelocity: 35,
          ticks: 300,
          gravity: 0.7,
        });
        break;

      default:
        window.confetti({
          ...base,
          startVelocity: 45,
        });
    }
  }

  /* -----------------------------------------------------------
     VOUCHER CARD RENDERING
  ----------------------------------------------------------- */
  function renderVoucher(config) {
    if (config?.type !== "voucher") return;

    const root = document.getElementById("confetti-launcher-root");
    if (!root) return;

    const code =
      config.code || config.voucherCode || config.voucher?.code || "";

    const html = `
      <div id="confetti-voucher-card" style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        background: white;
        border-radius: 18px;
        padding: 24px 28px 32px;
        width: 340px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: fadeSlideIn 0.6s ease-out forwards;
        opacity: 0;
      ">
        <div id="confetti-voucher-close" style="
          position:absolute;
          top:10px;
          right:12px;
          font-size:18px;
          cursor:pointer;
          color:#64748b;
          font-weight:600;
          padding:4px;
        ">&times;</div>

        <div style="font-size: 15px; font-weight: 600; color:#111;">
          ${config.title}
        </div>

        <div style="
          margin-top: 12px;
          padding: 14px;
          background:#f5f7fa;
          border-radius: 12px;
          font-weight: 700;
          letter-spacing: 0.25em;
          font-size: 18px;
          color:#1e293b;
          border: 1px solid #e2e8f0;
        ">
          ${code}
        </div>
      </div>

      <style>
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
      </style>
    `;

    root.innerHTML = html;

    const closeBtn = document.getElementById("confetti-voucher-close");
    const card = document.getElementById("confetti-voucher-card");

    if (closeBtn && card) {
      closeBtn.addEventListener("click", () => {
        card.style.transition = "opacity 0.3s, transform 0.3s";
        card.style.opacity = "0";
        card.style.transform = "translate(-50%, -20px)";
        setTimeout(() => card.remove(), 300);
      });
    }
  }

  /* -----------------------------------------------------------
     INIT — MAIN TRIGGER LOGIC
  ----------------------------------------------------------- */
  function init() {
    const raw = window.__CONFETTI_SETTINGS__;
    if (!raw) return;

    // Extract correct parts
    const config = raw.config?.confettiConfig || raw.config;
    let trigger = raw.config?.triggerEvent || raw.trigger;

    if (!config || !trigger) return;

    // Shopify sometimes outputs JSON string
    try {
      if (typeof trigger === "string") trigger = JSON.parse(trigger);
    } catch (e) {}

    if (!trigger.event) return;

    const today = new Date();
    const mmddToday =
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    // PAGE LOAD
    if (trigger.event === "page_load") {
      fireConfetti(config);
    }

    // PURCHASE COMPLETE
    if (trigger.event === "purchase_complete") {
      if (window.Shopify?.checkout) fireConfetti(config);
    }

    // NEW YEAR
    if (trigger.event === "new_year" && mmddToday === "01-01") {
      fireConfetti(config);
    }

    // CUSTOM DATE
    if (trigger.event === "custom_date") {
      const target = trigger.date || trigger.customDate;
      if (target && target === mmddToday) {
        fireConfetti(config);
      }
    }

    renderVoucher(config);
  }

  // Run init after confetti loads
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => waitForConfetti(init));
  else waitForConfetti(init);
})();
