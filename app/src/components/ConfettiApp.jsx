import React, { useState, useEffect } from "react";
import { useConfettiAPI } from "../hooks/useConfettiAPI";
import { TriggerEventModal } from "./TriggerEventModal";
import DashboardView from "./DashboardView";
import EditorView from "./EditorView";
import ConfettiInstructionsModal from "./ConfettiInstructionsModal";

import {
  PREDEFINED_CONFETTI,
  PREDEFINED_VOUCHERS,
} from "../constants/confettiConstants";

// Load canvas-confetti script
const loadConfetti = () => {
  if (typeof window !== "undefined" && window.confetti) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") return resolve();

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export default function ConfettiApp() {
  const { activateConfetti, deactivateConfetti } = useConfettiAPI();

  // -------------------------------------------------------------
  // 🟧 1) STATE
  // -------------------------------------------------------------
  const [savedConfetti, setSavedConfetti] = useState([]);
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [shopDomain, setShopDomain] = useState(null);

  const [view, setView] = useState("dashboard");
  const [activeDraftTab, setActiveDraftTab] = useState("confetti");
  const [contentSource, setContentSource] = useState("saved");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConfig, setActiveConfig] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const [triggerModalState, setTriggerModalState] = useState({
    open: false,
    resolve: null,
  });

  function dedupeByTitle(list) {
    const seen = new Set();
    return list.filter((item) => {
      if (seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    });
  }

  const fire = (cfg) => {
  if (!window.confetti) return;

  const base = {
    particleCount: cfg.particleCount || 150,
    spread: cfg.spread || 70,
    gravity: cfg.gravity ?? 1,
    origin: cfg.origin || { x: 0.5, y: 0.6 },
    colors: cfg.colors,
    shapes: cfg.shapes,
    startVelocity: cfg.startVelocity || 45,
    decay: cfg.decay || 0.9,
    drift: cfg.drift || 0,
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
};


  useEffect(() => {
    if (typeof window === "undefined") return;

    let confetti = JSON.parse(localStorage.getItem("savedConfetti") || "[]");
    let vouchers = JSON.parse(localStorage.getItem("savedVouchers") || "[]");

    // Remove wrong-type entries
    confetti = confetti.filter((c) => c.type === "confetti");
    vouchers = vouchers.filter((v) => v.type === "voucher");

    // 🔥 REMOVE DUPLICATES BY TITLE
    confetti = dedupeByTitle(confetti);
    vouchers = dedupeByTitle(vouchers);

    localStorage.setItem("savedConfetti", JSON.stringify(confetti));
    localStorage.setItem("savedVouchers", JSON.stringify(vouchers));

    setSavedConfetti(confetti);
    setSavedVouchers(vouchers);
  }, []);

  // -------------------------------------------------------------
  // 🟧 2) LOAD LOCAL STORAGE
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const confetti = JSON.parse(localStorage.getItem("savedConfetti") || "[]");
    const vouchers = JSON.parse(localStorage.getItem("savedVouchers") || "[]");

    setSavedConfetti(confetti);
    setSavedVouchers(vouchers);
  }, []);

  // save back to localStorage
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("savedConfetti", JSON.stringify(savedConfetti));
  }, [savedConfetti]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("savedVouchers", JSON.stringify(savedVouchers));
  }, [savedVouchers]);

  // -------------------------------------------------------------
  // 🟧 3) SHOP DOMAIN + LOAD CONFETTI LIBRARY
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShopDomain(window.Shopify?.shop || null);
    }
    loadConfetti();
  }, []);

  // -------------------------------------------------------------
  // 🟧 4) TRIGGER MODAL HELPERS
  // -------------------------------------------------------------
  const showTriggerEventModal = () =>
    new Promise((resolve) => {
      setTriggerModalState({ open: true, resolve });
    });

  const handleTriggerModalSelect = (payload) => {
    if (triggerModalState.resolve) triggerModalState.resolve(payload);
    setTriggerModalState({ open: false, resolve: null });
  };

  const handleTriggerModalClose = () => {
    if (triggerModalState.resolve) triggerModalState.resolve(null);
    setTriggerModalState({ open: false, resolve: null });
  };

  // -------------------------------------------------------------
  // 🟧 5) CREATE NEW DRAFT
  // -------------------------------------------------------------
  const handleCreateNew = (typeOverride) => {
    const type =
      typeof typeOverride === "string" ? typeOverride : activeDraftTab;

    setActiveConfig({
      id: Date.now().toString(),
      type,
      title: type === "confetti" ? "New Confetti Blast" : "New Voucher",
      particleCount: 150,
      spread: 70,
      shapes: type === "confetti" ? ["circle"] : [],
      gravity: 1.0,
      colors: ["#FFB396"],
      code: type === "voucher" ? "SAVE20" : "",
      burstType: "cannon",
      isPredefined: false,
      isActive: false,
    });

    setView("editor");
  };

  // -------------------------------------------------------------
  // 🟧 6) EDIT A DRAFT OR TEMPLATE
  // -------------------------------------------------------------
  const handleEditDraft = (item) => {
    if (item.isPredefined) {
      // convert template → draft
      setActiveConfig({
        ...item,
        id: Date.now().toString(),
        isPredefined: false,
        isActive: false,
        createdAt: "Just now",
        type: item.type, // keep original type, not activeDraftTab
      });
    } else {
      setActiveConfig({ ...item });
    }

    setView("editor");
  };

  // -------------------------------------------------------------
  // 🟧 7) SAVE DRAFT (NO DUPLICATES)
  // -------------------------------------------------------------
  const saveDraft = () => {
  if (!activeConfig) return null;

  const item = activeConfig;
  const setter =
    item.type === "confetti" ? setSavedConfetti : setSavedVouchers;

  setter((prev) => {
    const exists = prev.find((i) => i.id === item.id);

    let updated;

    if (exists) {
      updated = prev.map((i) =>
        i.id === item.id ? { ...i, ...item } : i
      );
    } else {
      updated = [
        {
          ...item,
          isActive: false,
          isPredefined: false,
          createdAt: "Just now",
        },
        ...prev,
      ];
    }

    updated = dedupeByTitle(updated);

    if (item.type === "confetti") {
      localStorage.setItem("savedConfetti", JSON.stringify(updated));
    } else {
      localStorage.setItem("savedVouchers", JSON.stringify(updated));
    }

    return updated;
  });

  setView("dashboard");
  return item;
};


  // -------------------------------------------------------------
  // 🟧 8) ACTIVATE LOGIC — ENFORCE “ONE ACTIVE PER TYPE + TRIGGER”
  // -------------------------------------------------------------
  const requestActivation = async (item) => {
  // Ask user for trigger
  const triggerEvent = await showTriggerEventModal();
  if (!triggerEvent) return;

  const trigger = triggerEvent.event || "page_load";

  // 🟩 1) Deactivate EVERY existing confetti + voucher
  setSavedConfetti((prev) =>
    prev.map((p) => ({ ...p, isActive: false }))
  );

  setSavedVouchers((prev) =>
    prev.map((p) => ({ ...p, isActive: false }))
  );

  // 🟩 2) Activate THIS one only
  const apply = (prev) => {
    const exists = prev.find((x) => x.id === item.id);

    if (exists) {
      return prev.map((x) =>
        x.id === item.id
          ? { ...x, ...item, isActive: true, trigger }
          : x
      );
    }

    return [
      { ...item, isActive: true, trigger, createdAt: "Just now" },
      ...prev,
    ];
  };

  if (item.type === "voucher") {
    setSavedVouchers(apply);
  } else {
    setSavedConfetti(apply);
  }

  // 🟩 3) Push active config to backend metafield
  await activateConfetti(item, triggerEvent);

  setShowInstructions(true);
};


  // -------------------------------------------------------------
  // 🟧 9) DEACTIVATE LOGIC (DO NOT DELETE FROM SAVED)
  // -------------------------------------------------------------
  const requestDeactivation = async (item) => {
    const isVoucher = item.type === "voucher";
    const setter = isVoucher ? setSavedVouchers : setSavedConfetti;

    setter((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, isActive: false } : p)),
    );

    await deactivateConfetti(item.id);
    setContentSource("saved");
  };

  // -------------------------------------------------------------
  // 🟧 10) TOGGLE ACTIVE
  // -------------------------------------------------------------
 const toggleActive = async (item) => {
  // If active → turn off
  if (item.isActive) {
    await requestDeactivation(item);
    return;
  }

  // If predefined, convert then activate
  if (item.isPredefined) {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      isPredefined: false,
      isActive: false,
      createdAt: "Just now",
      type: item.type,
    };

    if (item.type === "voucher") {
      setSavedVouchers((prev) => [newItem, ...prev]);
    } else {
      setSavedConfetti((prev) => [newItem, ...prev]);
    }

    await requestActivation(newItem);
    return;
  }

  // Activate normally
  await requestActivation(item);
};


  // -------------------------------------------------------------
  // 🟧 11) DELETE DRAFT — DO NOT DELETE IF ACTIVE
  // -------------------------------------------------------------
  const deleteDraft = async (item) => {
    const isVoucher = item.type === "voucher";
    const setter = isVoucher ? setSavedVouchers : setSavedConfetti;

    setter((prev) => prev.filter((i) => i.id !== item.id));
  };

  // -------------------------------------------------------------
  // 🟧 12) CURRENT LIST FOR DASHBOARD
  // -------------------------------------------------------------
  const currentList =
    activeDraftTab === "confetti"
      ? contentSource === "predefined"
        ? PREDEFINED_CONFETTI.map((i) => ({ ...i, type: "confetti" }))
        : savedConfetti
      : contentSource === "predefined"
        ? PREDEFINED_VOUCHERS.map((i) => ({ ...i, type: "voucher" }))
        : savedVouchers;

  const filteredList = currentList.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // -------------------------------------------------------------
  // 🟧 13) RENDER
  // -------------------------------------------------------------
  return (
    <>
      {view === "dashboard" ? (
        <DashboardView
          shopDomain={shopDomain}
          onShowInstructions={() => setShowInstructions(true)}
          activeDraftTab={activeDraftTab}
          setActiveDraftTab={setActiveDraftTab}
          contentSource={contentSource}
          setContentSource={setContentSource}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredList={filteredList}
          handleCreateNew={handleCreateNew}
          handleEditDraft={handleEditDraft}
          deleteDraft={deleteDraft}
          savedConfetti={savedConfetti}
          savedVouchers={savedVouchers}
          toggleActive={toggleActive}
          onDeactivate={requestDeactivation}
        />
      ) : (
        <EditorView
          activeConfig={activeConfig}
          setActiveConfig={setActiveConfig}
          fire={fire}
          saveDraft={saveDraft}
          setView={setView}
          savedConfetti={savedConfetti}
          savedVouchers={savedVouchers}
          onActivate={requestActivation}
          onDeactivate={requestDeactivation}
        />
      )}

      {triggerModalState.open && (
        <TriggerEventModal
          onSelect={handleTriggerModalSelect}
          onClose={handleTriggerModalClose}
        />
      )}

      <ConfettiInstructionsModal
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </>
  );
}
