(function () {
  function fireConfetti(cfg) {
    if (!window.confetti || !cfg) return;

    const base = {
      particleCount: cfg.particleCount || 150,
      spread: cfg.spread || 70,
      gravity: cfg.gravity ?? 1,
      origin: cfg.origin || { x: 0.5, y: 0.6 },
      colors: cfg.colors,
      shapes: cfg.shapes
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
              y: Math.random() * 0.4 + 0.1
            }
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

  function shouldTrigger(trigger) {
    if (!trigger || !trigger.type) return false;

    switch (trigger.type) {
      case "page_load":
        return true;

      case "purchase_complete":
        return (
          window.Shopify &&
          Shopify.checkout &&
          Shopify.checkout.order_id
        );

      case "new_year": {
        const d = new Date();
        return d.getMonth() === 0 && d.getDate() === 1;
      }

      case "custom_date": {
        const today = new Date();
        return (
          today.getMonth() + 1 === trigger.month &&
          today.getDate() === trigger.day
        );
      }

      default:
        return false;
    }
  }

  function handleSettings(settings) {
    if (!settings || !settings.config) return;

    if (shouldTrigger(settings.trigger)) {
      fireConfetti(settings.config);
    }
  }

  window.addEventListener("confetti:settings:ready", function (e) {
    handleSettings(e.detail);
  });
})();
