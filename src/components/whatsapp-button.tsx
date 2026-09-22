"use client";

/**
 * Floating WhatsApp contact button — requirements doc §20.
 * Hidden inside the portal, where it would sit over the dashboard chrome.
 */

import { usePathname } from "next/navigation";
import { brand } from "@/content/brand";
import { WhatsAppIcon } from "./icons";

export function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/portal")) return null;

  const message = encodeURIComponent(
    "Hello Prevsol Digital, I'd like to enquire about your services.",
  );

  return (
    <a
      href={`https://wa.me/${brand.whatsapp}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-500 sm:right-6 sm:bottom-6"
      aria-label="Chat with us on WhatsApp"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
