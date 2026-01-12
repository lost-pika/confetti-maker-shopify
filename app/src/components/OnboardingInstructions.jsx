import React from "react";
import { ExternalLink } from "lucide-react";

export default function OnboardingInstructions({ shop, themeId }) {
  const deepLink = `https://admin.shopify.com/store/${shop}/themes/${themeId}/editor?context=apps&activateAppBlockId=confetti_maker/confetti-launcher`;

  return (
    <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        How to Install the Confetti Launcher
      </h2>

      <p className="text-slate-600 mb-6">
        Follow these steps to install the Confetti Launcher app block in your
        theme. This enables confetti on your storefront based on your trigger
        settings.
      </p>

      <ol className="list-decimal ml-5 space-y-4 text-slate-700">
        <li>Open your online store theme editor.</li>

        <li>
          In the left sidebar, click{" "}
          <strong className="font-semibold">“Add app block”</strong>.
        </li>

        <li>
          Search for <strong>“Confetti Launcher”</strong>.
        </li>

        <li>
          Click <strong>Add</strong> to insert it into your theme.
        </li>

        <li>
          Save the theme to activate the confetti script on your storefront.
        </li>
      </ol>

      <div className="mt-8">
        <a
          href={deepLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors shadow-sm"
        >
          Open Theme Editor
          <ExternalLink size={16} />
        </a>
      </div>

      <p className="text-xs text-slate-400 mt-3">
        This link opens the theme editor with your app pre-selected, making
        installation easier for merchants.
      </p>
    </div>
  );
}
