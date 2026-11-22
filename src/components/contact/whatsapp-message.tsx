"use client";

import type { ReactNode } from "react";

export function WhatsAppMessage({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const digits = [52, 52, 55, 55, 57, 51, 48, 53, 48, 48, 57, 56]
          .map((code) => String.fromCharCode(code))
          .join("");
        const host = String.fromCharCode(119, 97, 46, 109, 101);
        window.open(`https://${host}/${digits}`, "_blank", "noopener,noreferrer");
      }}
    >
      {children}
    </button>
  );
}
