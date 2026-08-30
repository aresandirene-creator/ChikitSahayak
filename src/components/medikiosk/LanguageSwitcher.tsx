"use client";

import { useState } from "react";
import { useChikitsaHayakStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { LANGUAGES, type LangCode } from "@/lib/i18n";
import { Globe, Check } from "lucide-react";

/**
 * Language switcher. `compact` renders a small dropdown used in the header
 * (shown on every step). Otherwise it renders a full language grid used on
 * the preface screen. Changing the language here sets `uiLanguage` on the
 * store, which triggers the whole kiosk UI to re-render in that language.
 */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const uiLanguage = useChikitsaHayakStore((s) => s.uiLanguage);
  const setUiLanguage = useChikitsaHayakStore((s) => s.setUiLanguage);
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === uiLanguage) ?? LANGUAGES[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white hover:bg-red-50 px-3 py-1.5 text-sm text-red-800 transition-colors"
          aria-label={t("prefaceLanguagePrompt")}
        >
          <Globe className="size-4 text-red-600" />
          <span className="font-medium">{current.nativeName}</span>
          <svg viewBox="0 0 12 12" className="size-3 text-red-600"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-1 z-50 w-56 max-h-72 overflow-y-auto rounded-xl border border-red-200 bg-white shadow-lg scrollbar-thin">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setUiLanguage(l.code as LangCode);
                    setOpen(false);
                  }}
                  className={[
                    "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-red-50 transition-colors text-left",
                    l.code === uiLanguage ? "bg-red-50 text-red-800 font-semibold" : "text-red-900",
                  ].join(" ")}
                >
                  <span>
                    <span className="font-medium">{l.nativeName}</span>
                    <span className="text-xs text-red-600 ml-2">({l.name})</span>
                  </span>
                  {l.code === uiLanguage && <Check className="size-4 text-red-600" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full grid (preface)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setUiLanguage(l.code as LangCode)}
          className={[
            "flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-3 transition-all",
            l.code === uiLanguage
              ? "border-red-500 bg-red-50 text-red-800 shadow-sm"
              : "border-red-200 bg-white text-red-700 hover:border-red-400 hover:bg-red-50/50",
          ].join(" ")}
        >
          <span className="text-lg font-bold leading-none">{l.flag}</span>
          <span className="text-sm font-medium leading-tight">{l.nativeName}</span>
          <span className="text-[10px] text-red-500 leading-tight">{l.name}</span>
        </button>
      ))}
    </div>
  );
}
