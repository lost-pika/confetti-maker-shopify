// src/components/TriggerEventModal.jsx
import React, { useState } from "react";

const TRIGGER_EVENTS = [
  {
    id: "page_load",
    label: "On page load",
    description: "Fire confetti when the page loads.",
  },
  {
    id: "purchase_complete",
    label: "On purchase complete",
    description: "Celebrate when an order is completed.",
  },
  {
    id: "new_year",
    label: "On New Year",
    description: "Show confetti on January 1st.",
  },
  {
    id: "custom_date",
    label: "On a custom date",
    description: "Pick a specific month and day.",
  },
];

export function TriggerEventModal({ onSelect, onClose }) {
  const [selectedEvent, setSelectedEvent] = useState(TRIGGER_EVENTS[0].id);
  const [customDate, setCustomDate] = useState("");

  const handleConfirm = () => {
    const payload = {
      event: selectedEvent,
      customDate: selectedEvent === "custom_date" ? customDate : null,
    };
    onSelect(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">
          When should confetti appear?
        </h2>

        <div className="space-y-3 mb-6">
          {TRIGGER_EVENTS.map((event) => (
            <label
              key={event.id}
              className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <input
                type="radio"
                name="trigger-event"
                value={event.id}
                checked={selectedEvent === event.id}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="mt-1 cursor-pointer"
              />
              <div>
                <div className="font-bold text-sm text-slate-900">
                  {event.label}
                </div>
                <div className="text-xs text-slate-500">
                  {event.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        {selectedEvent === "custom_date" && (
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-600 block mb-2">
              Date (MM-DD)
            </label>
            <input
              type="text"
              placeholder="01-15"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
