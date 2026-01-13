(function () {
  function waitForConfetti(cb) {
    if (window.confetti) cb();
    else setTimeout(() => waitForConfetti(cb), 50);
  }

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
      case "fireworks": {
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
      }

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

  function renderVoucher(config) {
    if (config?.type !== "voucher") return;

    const root = document.getElementById("confetti-launcher-root");
    if (!root) return;

    const code = config.voucherCode || config.voucher?.code || "";

    const html = `
      <div style="
        max-width: 360px;
        margin: 20px auto;
        padding: 20px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        text-align: center;
        font-family: sans-serif;
      ">
        <div style="font-size: 14px; color:#555;">${config.title}</div>
        <div style="
          margin-top: 10px;
          padding: 12px;
          background:#f4f6f8;
          border-radius: 10px;
          font-weight: bold;
          letter-spacing: 3px;
        ">
          ${code}
        </div>
      </div>
    `;

    root.innerHTML = html;
  }

  function init() {
    const settings = window.__CONFETTI_SETTINGS__;
    if (!settings?.config) return;

    const config = settings.config;

    // 🎉 Fire confetti based on trigger
    if (settings.trigger === "page_load") fireConfetti(config);

    if (settings.trigger === "purchase_complete") {
      if (window.Shopify?.checkout) fireConfetti(config);
    }

    // 🎟 Render voucher UI
    renderVoucher(config);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => waitForConfetti(init));
  else waitForConfetti(init);
})();
