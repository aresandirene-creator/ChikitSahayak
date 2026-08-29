"use client";

import { useMediKioskStore } from "@/lib/store";

/**
 * Returns whether the kiosk is in "graphical" mode (icon-heavy, minimal text,
 * designed for uneducated users) or "normal" mode (text-heavy). Set on the
 * preface screen; applies across every step.
 */
export function useUiMode() {
  const uiMode = useMediKioskStore((s) => s.uiMode);
  const setUiMode = useMediKioskStore((s) => s.setUiMode);
  const graphical = uiMode === "graphical";
  return { graphical, uiMode, setUiMode };
}
