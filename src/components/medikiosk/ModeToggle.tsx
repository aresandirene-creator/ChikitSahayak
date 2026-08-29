"use client";

import { useMediKioskStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { Type, ImageIcon } from "lucide-react";

/**
 * Normal / Graphical UI mode toggle. Shown on the preface screen so the
 * patient (or assisting staff) can choose whether the kiosk shows the full
 * text-based interface or a simplified, picture-driven one. Persists across
 * patients (kept in the store through reset()).
 */
export function ModeToggle() {
  const uiMode = useMediKioskStore((s) => s.uiMode);
  const setUiMode = useMediKioskStore((s) => s.setUiMode);
  const { t } = useI18n();

  const options = [
    {
      key: "normal" as const,
      icon: Type,
      label: t("modeNormal"),
      desc: t("modeNormalDesc"),
      color: "bg-white text-sky-700",
      activeColor: "border-sky-500 bg-sky-50 text-sky-800 shadow-sm",
    },
    {
      key: "graphical" as const,
      icon: ImageIcon,
      label: t("modeGraphical"),
      desc: t("modeGraphicalDesc"),
      color: "bg-white text-rose-600",
      activeColor: "border-rose-500 bg-rose-50 text-rose-700 shadow-sm",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center text-sm font-semibold text-sky-700/80 mb-1">
        {t("modeToggleTitle")}
      </div>
      <p className="text-center text-xs text-muted-foreground mb-3">{t("modeToggleDesc")}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => {
          const active = uiMode === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => setUiMode(o.key)}
              className={[
                "rounded-2xl border-2 p-4 flex items-center gap-3 transition-all text-left",
                active ? o.activeColor : "border-sky-200 bg-white text-sky-700 hover:bg-sky-50/50",
              ].join(" ")}
              aria-pressed={active}
            >
              <div className={[
                "size-12 rounded-xl flex items-center justify-center shrink-0",
                active ? o.color : o.color,
              ].join(" ")}>
                <o.icon className="size-6" />
              </div>
              <div className="min-w-0">
                <div className="font-bold leading-tight">{o.label}</div>
                <div className="text-xs opacity-80 leading-tight mt-0.5">{o.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
