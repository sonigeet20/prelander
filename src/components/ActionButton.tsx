"use client";

import { useRef } from "react";

interface ActionButtonProps {
  href: string;
  secondaryHref?: string;
  dualNav?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ActionButton({
  href,
  secondaryHref,
  dualNav,
  children,
  className,
  style,
}: ActionButtonProps) {
  const firedRef = useRef(false);

  const handleClick = () => {
    if (dualNav && secondaryHref && !firedRef.current) {
      firedRef.current = true;
      window.open(secondaryHref, "_blank", "noopener,noreferrer");
    }
    window.location.href = href;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}
