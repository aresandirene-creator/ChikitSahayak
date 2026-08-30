"use client";

/**
 * ChikitsaHayak logo — a filled heart with a pulse/heartbeat (EKG) line
 * through it. Universally recognised as a medical / healthcare symbol;
 * "chikitsa" means treatment and "hayak" means helper in Sanskrit/Hindi.
 *
 * `iconSize` controls the SVG size in px. `container` wraps it in a coloured
 * rounded box (use for the header). Without `container` it renders just the
 * SVG (use inline, e.g. in badges).
 */
export function ChikitsaHayakLogo({
  iconSize = 24,
  container = false,
  containerClass = "bg-sky-600 text-white",
  className = "",
}: {
  iconSize?: number;
  container?: boolean;
  containerClass?: string;
  className?: string;
}) {
  const svg = (
    <svg
      viewBox="0 0 24 24"
      style={{ width: iconSize, height: iconSize }}
      className={className}
      aria-hidden="true"
    >
      {/* Filled heart */}
      <path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"
        fill="currentColor"
      />
      {/* Pulse / heartbeat line (white, through the heart) */}
      <path
        d="M3.5 12.5H7.5l1.5-3.5 2 6 1.5-3H13l1-1.5h3.5"
        stroke="white"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (!container) return svg;

  const dim = iconSize + 16; // padding around the icon
  return (
    <div
      className={`rounded-xl flex items-center justify-center shadow-sm ${containerClass} ${className}`}
      style={{ width: dim, height: dim }}
    >
      {svg}
      <span className="sr-only">ChikitsaHayak</span>
    </div>
  );
}
