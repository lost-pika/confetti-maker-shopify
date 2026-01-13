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
      origin: { x: 0.5, y: 0.6 },
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
            origin: { x: 0.2 + 0.3 * i, y: Math.random() * 0.4 + 0.1 },
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
        window.confetti({ ...base, startVelocity: 45 });
    }
  }

  function renderVoucher(config) {
    if (config?.type !== "voucher") return;

    const root = document.getElementById("confetti-launcher-root");
    if (!root) return;

    const code = config.code || "";

    root.innerHTML = `
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
        animation: fadeSlideIn 0.6s ease-out forwards;
        opacity: 0;
      ">
        <div id="confetti-voucher-close" style="
          position:absolute; top:10px; right:12px; font-size:18px; cursor:pointer;
        ">&times;</div>

        <div style="font-size: 15px; font-weight: 600;">${config.title}</div>

        <div style="
          margin-top: 12px;
          padding: 14px;
          background:#f5f7fa;
          border-radius: 12px;
          font-weight: 700;
          letter-spacing: 0.25em;
          font-size: 18px;
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
  }

  function init() {
    const s = window.__CONFETTI_SETTINGS__;
    if (!s || !s.config) return;

    const config = s.config;
    const trigger = s.trigger;

    const today = new Date();
    const mmdd =
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    /* ------------------------------------------------------
       PAGE LOAD → fire only if explicitly selected
    ------------------------------------------------------ */
    if (trigger === "page_load") {
      fireConfetti(config);
    }

    /* ------------------------------------------------------
       NEW YEAR → fire ONLY on 01-01
    ------------------------------------------------------ */
    if (trigger === "new_year" && mmdd === "01-01") {
      fireConfetti(config);
    }

    /* Voucher UI */
    renderVoucher(config);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () =>
      waitForConfetti(init)
    );
  else waitForConfetti(init);
})();
