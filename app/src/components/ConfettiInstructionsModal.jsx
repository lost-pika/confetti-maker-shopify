import React from "react";

export default function ConfettiInstructionsModal({ open, onClose }) {
  if (!open) return null;

  const shop = window.Shopify?.shop;
  const deepLink = shop
    ? `https://admin.shopify.com/store/${shop}/themes/current/editor?context=apps`
    : "https://admin.shopify.com/themes";

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl border border-gray-200">
        <h2 className="text-xl font-semibold mb-3">
          Enable Confetti on Your Storefront
        </h2>

        <ol className="list-decimal list-inside text-gray-700 text-sm space-y-2">
          <li>Click <b>Open Theme Editor</b>.</li>
          <li>Click <b>Edit theme</b>.</li>
          <li>Open <b>App embeds</b> from the sidebar.</li>
          <li>Enable <b>Confetti Maker – App Embed</b>.</li>
          <li>Click <b>Save</b>.</li>
          <li>Reload your storefront to test the confetti event.</li>
        </ol>

        {/* Deep Link Button */}
        <a
          href={deepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block px-5 py-2.5 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors"
        >
          Open Theme Editor
        </a>

        <div className="mt-6 flex justify-end">
          <button
            className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
