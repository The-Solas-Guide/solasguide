import type { Metadata } from "next";
import { DesignSystemReview } from "@/components/design-system/design-system-review";

export const metadata: Metadata = {
  title: "Design system review | The Solas Guide",
  description: "Internal design-system review surface for The Solas Guide.",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <DesignSystemReview />;
}
