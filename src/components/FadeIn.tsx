"use client";

import { type ReactNode } from "react";

/**
 * FadeIn wrapper — renders content fully visible immediately.
 *
 * Previously used IntersectionObserver + opacity:0 initial state,
 * which Google may flag as hidden content. Now just a simple
 * pass-through wrapper with no hidden-content risk.
 */
export function FadeIn({
  children,
  delay: _delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
