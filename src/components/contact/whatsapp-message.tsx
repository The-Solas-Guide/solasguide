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
        const digits = [54, 50, 56, 49, 51, 51, 48, 54, 51, 49, 48, 51, 48]
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
