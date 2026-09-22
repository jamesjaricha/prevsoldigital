"use client";

import { DownloadIcon } from "./icons";
import { Button } from "./ui";

/**
 * The invoice "Download PDF" action. Printing needs a browser API, so this is
 * the only interactive island on an otherwise server-rendered invoice.
 */
export function PrintButton() {
  return (
    <Button variant="outline" size="lg" onClick={() => window.print()}>
      <DownloadIcon className="size-4" />
      Download PDF
    </Button>
  );
}
