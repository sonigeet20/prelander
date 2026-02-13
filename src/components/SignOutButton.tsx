"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();

  function handleSignOut() {
    signOut({ redirect: false }).then(() => {
      router.push("/auth/login");
    });
  }

  return (
    <button
      onClick={handleSignOut}
      className={className || "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"}
    >
      <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Sign Out
    </button>
  );
}
