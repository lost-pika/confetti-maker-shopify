// app/src/components/ConfettiApp.jsx
import React, { useState, useEffect } from "react";
import { useConfettiAPI } from "../hooks/useConfettiAPI";
import { TriggerEventModal } from "./TriggerEventModal";
import DashboardView from "./DashboardView";
import EditorView from "./EditorView";
import ConfettiInstructionsModal from "./ConfettiInstructionsModal";

import {
  SHAPE_OPTIONS,
  BURST_TYPES,
  PREDEFINED_CONFETTI,
  PREDEFINED_VOUCHERS,
} from "../constants/confettiConstants";

const loadConfetti = () => {
  if (typeof window !== "undefined" && window.confetti) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      resolve();
      return;
    }
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

  const [shopDomain, setShopDomain] = useState(null);

  useEffect(() => {
  const confetti = JSON.parse(localStorage.getItem("savedConfetti") || "[]");
  const vouchers = JSON.parse(localStorage.getItem("savedVouchers") || "[]");

  setSavedConfetti(confetti);
  setSavedVouchers(vouchers);
}, []);

useEffect(() => {
  localStorage.setItem("savedConfetti", JSON.stringify(savedConfetti));
}, [savedConfetti]);

useEffect(() => {
  localStorage.setItem("savedVouchers", JSON.stringify(savedVouchers));
}, [savedVouchers]);


  useEffect(() => {
    if (typeof window !== "undefined") {
      setShopDomain(window.Shopify?.shop || null);
    }
  }, []);

  const [triggerModalState, setTriggerModalState] = useState({
    open: false,
    resolve: null,
  });

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

  const showNotification = (msg) => {
    console.log(msg);
  };

  const [view, setView] = useState("dashboard");
  const [activeDraftTab, setActiveDraftTab] = useState("confetti");
  const [contentSource, setContentSource] = useState("saved");
  const [searchQuery, setSearchQuery] = useState("");

  const [savedConfetti, setSavedConfetti] = useState([]);
  const [savedVouchers, setSavedVouchers] = useState([]);
  const [activeConfig, setActiveConfig] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const fireConfetti = (config) => {
    if (typeof window === "undefined" || !window.confetti || !config) return;

    const {
      particleCount,
      spread,
      gravity,
      shapes,
      colors,
      burstType,
      origin,
    } = config;

    const base = {
      particleCount: particleCount || 150,
      spread: spread || 70,
      gravity: gravity ?? 1,
      origin: origin || { x: 0.5, y: 0.6 },
      colors: colors && colors.length ? colors : undefined,
      shapes: shapes && shapes.length ? shapes : undefined,
    };

    switch (burstType) {
      case "cannon":
        window.confetti({
          ...base,
          angle: 60,
          spread: base.spread ?? 60,
          startVelocity: 60,
          scalar: 1.0,
          ticks: 150,
        });
        break;

      case "fireworks":
        // multi‑burst fireworks from different origins
        const count = 3;
        const defaults = {
          ...base,
          particleCount: Math.round((base.particleCount ?? 180) / count),
          spread: base.spread ?? 80,
          startVelocity: 50,
          ticks: 250,
          gravity: base.gravity ?? 0.9,
        };

        for (let i = 0; i < count; i++) {
          window.confetti({
            ...defaults,
            origin: {
              x: 0.2 + 0.3 * i,
              y: Math.random() * 0.4 + 0.1,
            },
          });
        }
        break;

      case "pride":
        window.confetti({
          ...base,
          spread: base.spread ?? 120,
          startVelocity: 35,
          scalar: 1.2,
          ticks: 300,
          gravity: base.gravity ?? 0.7,
        });
        break;

      case "snow":
        window.confetti({
          ...base,
          particleCount: base.particleCount ?? 250,
          spread: base.spread ?? 160,
          gravity: base.gravity ?? 0.3,
          startVelocity: 10,
          scalar: 0.8,
          ticks: 400,
          drift: 0.6,
        });
        break;

      default:
        window.confetti({
          ...base,
          startVelocity: 45,
          spread: base.spread ?? 70,
        });
    }
  };

  useEffect(() => {
    loadConfetti();
  }, []);

  useEffect(() => {
    if (view === "dashboard") setActiveConfig(null);
  }, [view]);

  


  const handleCreateNew = (typeOverride) => {
    const type =
      typeof typeOverride === "string" ? typeOverride : activeDraftTab;

    setActiveConfig({
      id: Date.now().toString(),
      type,
      title: type === "confetti" ? "New Confetti Blast" : "New Voucher",
      particleCount: 150,
      spread: 70,
      shapes: ["circle"],
      gravity: 1.0,
      drift: 0,
      startVelocity: 45,
      decay: 0.9,
      origin: { x: 0.5, y: 0.6 },
      colors: ["#FFB396", "#FFD1BA"],
      code: type === "voucher" ? "SAVE20" : "",
      burstType: "cannon",
      isPredefined: false,
      isActive: false,
    });

    setView("editor");
  };

  const handleEditDraft = (item) => {
    if (item.isPredefined) {
      setActiveConfig({
        ...item,
        id: Date.now().toString(),
        type: activeDraftTab,
        isPredefined: false,
        isActive: false,
        createdAt: "Just now",
      });
    } else {
      setActiveConfig({ ...item });
    }
    setView("editor");
  };

  const saveDraft = () => {
    if (!activeConfig) return null;
    const setter =
      activeConfig.type === "confetti" ? setSavedConfetti : setSavedVouchers;

    setter((prev) => {
      const exists = prev.find((i) => i.id === activeConfig.id);
      if (exists) {
        return prev.map((i) =>
          i.id === activeConfig.id ? { ...activeConfig } : i,
        );
      }
      return [
        {
          ...activeConfig,
          createdAt: "Just now",
          isPredefined: false,
          isActive: false,
        },
        ...prev,
      ];
    });

    setView("dashboard");
    return activeConfig;
  };

  const markActiveInState = (item) => {
    const setter =
      item.type === "confetti" ? setSavedConfetti : setSavedVouchers;

    setter((prev) => {
      const exists = prev.find((i) => i.id === item.id);

      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, isActive: true } : i,
        );
      }

      return [
        { ...item, isActive: true, isPredefined: false, createdAt: "Just now" },
        ...prev,
      ];
    });
  };

  const markInactiveInState = (itemId, type) => {
    const setter = type === "confetti" ? setSavedConfetti : setSavedVouchers;

    setter((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isActive: false } : i)),
    );
  };

  // shared activation request (used by Toggle + Editor)
  const requestActivation = async (item) => {
    const triggerEvent = await showTriggerEventModal();
    if (!triggerEvent) return;

    await activateConfetti(item, triggerEvent);
    setShowInstructions(true);

    const setter =
      item.type === "voucher" ? setSavedVouchers : setSavedConfetti;

    setter((prev) => {
      const exists = prev.find((i) => i.id === item.id);

      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, isActive: true } : i,
        );
      }

      // 🔥 THIS WAS MISSING
      return [
        { ...item, isActive: true, isPredefined: false, createdAt: "Just now" },
        ...prev,
      ];
    });
  };

  // shared deactivation
  const requestDeactivation = async (item) => {
    await deactivateConfetti(item.id);

    const setter =
      item.type === "voucher" ? setSavedVouchers : setSavedConfetti;

    setter((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isActive: false } : i)),
    );

    // 🔥 THIS IS THE MISSING PART
    setContentSource("saved");
  };

  const forceDeactivateInUI = (item) => {
    const setter =
      item.type === "confetti" ? setSavedConfetti : setSavedVouchers;

    setter((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isActive: false } : i)),
    );

    setContentSource("saved");
  };

  const toggleActive = async (item) => {
    const source = item.type === "confetti" ? savedConfetti : savedVouchers;

    // try to get fresh state version
    const freshItem = source.find((i) => i.id === item.id) || item;

    // 🔴 DEACTIVATE
    if (freshItem.isActive) {
      await requestDeactivation(freshItem);
      setContentSource("saved");
      return;
    }

    // 🔵 ACTIVATE TEMPLATE (convert once)
    if (freshItem.isPredefined) {
      const newItem = {
        ...freshItem,
        id: Date.now().toString(),
        isPredefined: false,
        isActive: false,
        createdAt: "Just now",
      };

      const setter =
        freshItem.type === "confetti" ? setSavedConfetti : setSavedVouchers;

      setter((prev) => [newItem, ...prev]);

      // 🔥 modal opens here
      await requestActivation(newItem);
      return;
    }

    // 🟢 ACTIVATE SAVED DRAFT
    await requestActivation(freshItem);
  };

  const deleteDraft = async (item) => {
    // if (item.isActive) {
    //   await activateConfetti(item, triggerEvent);
    //   setShowOnboarding(true);
    // }

    const setter =
      item.type === "confetti" ? setSavedConfetti : setSavedVouchers;

    setter((prev) => prev.filter((i) => i.id !== item.id));
  };

  const currentList =
    activeDraftTab === "confetti"
      ? contentSource === "predefined"
        ? PREDEFINED_CONFETTI
        : savedConfetti
      : contentSource === "predefined"
        ? PREDEFINED_VOUCHERS
        : savedVouchers;

  const filteredList = currentList.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
          fire={fireConfetti}
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
