"use client";

import { useEffect } from "react";

const revealSelector = "[data-reveal]";

function isInView(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  return rect.top < viewportHeight * 0.92 && rect.bottom > 0;
}

export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(revealSelector),
    );

    if (
      targets.length === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    targets.forEach((target) => {
      if (isInView(target)) {
        target.dataset.revealState = "visible";
      }
    });

    root.dataset.motionReady = "true";

    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => {
        target.dataset.revealState = "visible";
      });

      return () => {
        delete root.dataset.motionReady;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLElement;
          target.dataset.revealState = "visible";
          observer.unobserve(target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    targets
      .filter((target) => target.dataset.revealState !== "visible")
      .forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      delete root.dataset.motionReady;

      targets.forEach((target) => {
        delete target.dataset.revealState;
      });
    };
  }, []);

  return null;
}
