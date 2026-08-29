"use client";

import { useEffect } from "react";

/**
 * Register a handler that runs when the user clicks the global "Continue"
 * button in the sticky workflow footer. This lets each step expose its own
 * submit logic (create patient, persist consents, confirm summary, etc.)
 * while still allowing the footer to be the primary navigation path —
 * which avoids the case where an in-card button is covered by the footer.
 */
export function useContinueHandler(handler: () => void | Promise<void>) {
  useEffect(() => {
    const listener = () => {
      try {
        void handler();
      } catch (e) {
        console.error("continue handler failed", e);
      }
    };
    window.addEventListener("medikiosk-continue", listener);
    return () => window.removeEventListener("medikiosk-continue", listener);
  });
}
