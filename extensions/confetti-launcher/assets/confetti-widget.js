(function () {
  function waitForConfetti(cb) {
    if (window.confetti) {
      cb();
    } else {
      setTimeout(() => waitForConfetti(cb), 50);
    }
  }

  function fireConfetti(cfg) {
    window.confetti({
      particleCount: cfg.particleCount || 150,
      spread: cfg.spread || 70,
      gravity: cfg.gravity ?? 1,
      origin: cfg.origin || { x: 0.5, y: 0.6 },
      colors: cfg.colors,
      shapes: cfg.shapes
    });
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
    ? document.addEventListener("DOMContentLoaded", () => waitForConfetti(init))
    : waitForConfetti(init);
})();
