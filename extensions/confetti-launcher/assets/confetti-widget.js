(function () {
  function waitForConfetti(cb) {
    if (window.confetti) {
      cb();
    } else {
      setTimeout(() => waitForConfetti(cb), 50);
    }
  }

  function fireConfetti(cfg) {
    if (!cfg || !window.confetti) return;

    const base = {
      particleCount: cfg.particleCount || 150,
      spread: cfg.spread || 70,
      gravity: cfg.gravity ?? 1,
      origin: cfg.origin || { x: 0.5, y: 0.6 },
      colors: cfg.colors,
      shapes: cfg.shapes
    };

    switch (cfg.burstType) {
      case "fireworks": {
        const count = 3;
        for (let i = 0; i < count; i++) {
          window.confetti({
            ...base,
            particleCount: Math.round(base.particleCount / count),
            startVelocity: 50,
            ticks: 250,
            origin: {
              x: 0.2 + 0.3 * i,
              y: Math.random() * 0.4 + 0.1
            }
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
          ticks: 400
        });
        break;

      case "pride":
        window.confetti({
          ...base,
          spread: 120,
          startVelocity: 35,
          ticks: 300,
          gravity: 0.7
        });
        break;

      case "cannon":
      default:
        window.confetti({
          ...base,
          startVelocity: 45
        });
    }
  }

  function init() {
    var settings = window.__CONFETTI_SETTINGS__;
    if (!settings || !settings.config) return;

    if (settings.trigger === "page_load") {
      fireConfetti(settings.config);
    }

    if (settings.trigger === "purchase_complete") {
      if (window.Shopify && Shopify.checkout) {
        fireConfetti(settings.config);
      }
    }
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", () =>
        waitForConfetti(init)
      )
    : waitForConfetti(init);
})();
