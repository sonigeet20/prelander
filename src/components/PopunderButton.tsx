"use client";

import { useRef } from "react";

interface PopunderButtonProps {
  href: string;
  popunderUrl?: string;
  enabled?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function PopunderButton({
  href,
  popunderUrl,
  enabled,
  children,
  className,
  style,
}: PopunderButtonProps) {
  const openedRef = useRef(false);

  const handleClick = () => {
    if (enabled && popunderUrl && !openedRef.current) {
      openedRef.current = true;
      window.open(popunderUrl, "_blank", "noopener,noreferrer");
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
