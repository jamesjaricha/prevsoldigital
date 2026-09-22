import Image from "next/image";
import Link from "next/link";
import { brand } from "@/content/brand";
import { cx } from "./ui";

/**
 * The Prevsol Digital wordmark.
 *
 * Two artwork variants ship because the supplied logo is dark navy, which
 * disappears against the navy footer and in dark mode:
 *
 *  - `logo.png`       the original, for light backgrounds
 *  - `logo-light.png` the wordmark lifted to white, for dark backgrounds
 *
 * Both are transparent PNGs trimmed to the artwork, so they can be sized by
 * height without carrying the white margin the original had.
 *
 * The tagline is part of the artwork, so `showTagline` picks between the full
 * lockup and a cropped, wordmark-only rendering.
 */

/** Intrinsic size of the trimmed artwork, used to keep the aspect ratio. */
const ART_WIDTH = 1400;
const ART_HEIGHT = 410;

export function Logo({
  className,
  tone = "default",
  showTagline = true,
  /** Rendered height in pixels. Width follows the aspect ratio. */
  height,
  priority = false,
}: {
  className?: string;
  tone?: "default" | "inverse";
  showTagline?: boolean;
  height?: number;
  priority?: boolean;
}) {
  // Without the tagline we show a shorter crop, so the mark stays optically
  // the same size in the header as the full lockup does elsewhere.
  const h = height ?? (showTagline ? 46 : 34);
  const src =
    tone === "inverse" ? "/brand/logo-light.png" : "/brand/logo.png";

  return (
    <span
      className={cx(
        "inline-flex items-center",
        // In dark mode the light variant is swapped in via CSS, so the
        // component does not need to know the colour scheme.
        tone === "default" && "dark:hidden",
        className,
      )}
    >
      <Image
        src={src}
        alt={`${brand.name} — ${brand.tagline}`}
        width={ART_WIDTH}
        height={ART_HEIGHT}
        priority={priority}
        sizes={`${Math.round((h * ART_WIDTH) / ART_HEIGHT)}px`}
        style={{ height: h, width: "auto" }}
        className={cx(
          "w-auto object-contain object-left",
          // Crop the tagline away by clipping the bottom third of the artwork.
          !showTagline && "[clip-path:inset(0_0_13%_0)]",
        )}
      />
    </span>
  );
}

/**
 * Dark-mode companion. Rendered alongside `Logo` so the correct artwork shows
 * without any client-side colour-scheme detection.
 */
function LogoDark({
  showTagline = true,
  height,
  priority = false,
}: {
  showTagline?: boolean;
  height?: number;
  priority?: boolean;
}) {
  const h = height ?? (showTagline ? 46 : 34);
  return (
    <span className="hidden items-center dark:inline-flex">
      <Image
        src="/brand/logo-light.png"
        alt=""
        aria-hidden
        width={ART_WIDTH}
        height={ART_HEIGHT}
        priority={priority}
        sizes={`${Math.round((h * ART_WIDTH) / ART_HEIGHT)}px`}
        style={{ height: h, width: "auto" }}
        className={cx(
          "w-auto object-contain object-left",
          !showTagline && "[clip-path:inset(0_0_13%_0)]",
        )}
      />
    </span>
  );
}

/** Logo wrapped in a link home, used in the header and footer. */
export function LogoLink({
  className,
  tone = "default",
  showTagline = true,
  height,
  priority = false,
}: {
  className?: string;
  tone?: "default" | "inverse";
  showTagline?: boolean;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cx(
        "inline-flex shrink-0 items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-500",
        className,
      )}
      aria-label={`${brand.name} — home`}
    >
      <Logo
        tone={tone}
        showTagline={showTagline}
        height={height}
        priority={priority}
      />
      {tone === "default" && (
        <LogoDark
          showTagline={showTagline}
          height={height}
          priority={priority}
        />
      )}
    </Link>
  );
}
