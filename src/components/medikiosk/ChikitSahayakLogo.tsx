"use client";

/**
 * ChikitSahayak logo — uses the uploaded official brand image
 * (a human-head silhouette with circuit pathways inside, orange→green
 * gradient, with "CHIKITSAHAYAK" + "DIGITAL BARATH" text below).
 *
 * The image lives at /chikitsahayak-logo.png in /public. We render it as a
 * responsive <img> so it scales nicely at any size.
 */
export function ChikitSahayakLogo({
  size = 40,
  className = "",
  rounded = true,
}: {
  size?: number;
  className?: string;
  rounded?: boolean;
}) {
  return (
    <img
      src="/chikitsahayak-logo.png"
      alt="ChikitSahayak logo"
      width={size}
      height={size}
      className={`${rounded ? "rounded-xl" : ""} object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
