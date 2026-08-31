"use client";

import { useChikitSahayakStore } from "@/lib/store";
import { translations, type LangCode } from "@/lib/i18n";

/**
 * Returns a `t(key, vars?)` function bound to the current UI language. The
 * whole kiosk UI re-renders in the patient's preferred language whenever the
 * store's `uiLanguage` changes (set from the identify-step language picker or
 * the preface-screen language picker).
 *
 * Variable interpolation: {name} style placeholders are replaced from `vars`.
 * Example: t("completeSubtitle", { name: patient.name })
 */
export function useI18n() {
  const lang = useChikitSahayakStore((s) => s.uiLanguage);
  const dict = translations[lang] ?? translations.en;

  const t = (key: keyof typeof dict, vars?: Record<string, string | number>): string => {
    let str = (dict[key] as string) ?? (translations.en[key] as string) ?? String(key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, String(v));
      }
    }
    return str;
  };

  return { t, lang };
}
