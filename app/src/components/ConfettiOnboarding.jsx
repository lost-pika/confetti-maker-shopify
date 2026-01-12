import React from "react";

export default function ConfettiOnboarding({ shop, themeId, onDone }) {
  const deepLink = `https://admin.shopify.com/store/${shop}/themes/${themeId}/editor?context=apps&activateAppBlockId=confetti_maker/confetti-launcher`;

  return (
    <div className="p-8 min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="bg-white rounded-xl p-10 w-full max-w-xl border border-gray-200 shadow-xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800">Setup Almost Done</h1>
          <p className="text-gray-600 mt-2">
            You must enable the Confetti Launcher in your theme to display
            celebrations on your storefront.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">
            Enable Confetti Launcher App Block
          </h2>

          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
            <li>Click “Open Theme Editor”.</li>
            <li>In the left sidebar, click “Add App Block”.</li>
            <li>Select <strong>Confetti Launcher</strong>.</li>
            <li>Click Save.</li>
          </ol>

          <p className="text-xs text-gray-500 mt-3">
            This is required by Shopify to render confetti on your storefront.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href={deepLink}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center px-5 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
          >
            Open Theme Editor
          </a>

          <button
            onClick={onDone}
            className="px-5 py-3 flex-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}
