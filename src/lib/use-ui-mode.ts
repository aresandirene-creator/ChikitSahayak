"use client";

import { useChikitSahayakStore } from "@/lib/store";

/**
 * Returns whether the kiosk is in "graphical" mode (icon-heavy, minimal text,
 * designed for uneducated users) or "normal" mode (text-heavy). Set on the
 * preface screen; applies across every step.
 */
export function useUiMode() {
  const uiMode = useChikitSahayakStore((s) => s.uiMode);
  const setUiMode = useChikitSahayakStore((s) => s.setUiMode);
  const graphical = uiMode === "graphical";
  return { graphical, uiMode, setUiMode };
}
