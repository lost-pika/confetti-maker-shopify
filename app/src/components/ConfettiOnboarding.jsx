import React from "react";
import { Sparkles } from "lucide-react";

export default function ConfettiSetupBanner({ shop }) {
  if (!shop) return null;

  const deepLink = `https://admin.shopify.com/store/${shop}/themes/current/editor?context=apps&activateAppBlockId=confetti_maker/confetti-launcher`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow mb-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-md">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">
            Install Confetti Launcher on Your Storefront
          </h2>

          <p className="text-slate-600 text-sm mt-2">
            To display confetti on your store, you must enable the 
            <strong> Confetti Launcher app block</strong> in your theme.
          </p>

          <ol className="list-decimal list-inside text-sm text-slate-700 mt-4 space-y-1">
            <li>Click the button below to open the theme editor.</li>
            <li>Click <strong>Add app block</strong>.</li>
            <li>Select <strong>Confetti Launcher</strong>.</li>
            <li>Click <strong>Save</strong>.</li>
          </ol>

          <a
            href={deepLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-5 px-5 py-3 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
          >
            Open Theme Editor
          </a>
        </div>
      </div>
    </div>
  );
}
