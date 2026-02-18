"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OffersManager } from "@/components/admin/OffersManager";

function OffersContent() {
  const searchParams = useSearchParams();
  const brandId = searchParams.get("brandId") || undefined;
  return <OffersManager initialBrandId={brandId} />;
}

export default function AdminOffersPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-400">Loading…</div>}>
      <OffersContent />
    </Suspense>
  );
}
