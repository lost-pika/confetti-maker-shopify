// app/src/components/ToggleSwitch.jsx
import React from "react";

export const ToggleSwitch = ({ active, onToggle }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
      active ? "bg-green-500" : "bg-slate-200"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        active ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);
