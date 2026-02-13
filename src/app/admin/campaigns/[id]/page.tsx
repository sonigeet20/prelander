import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { CampaignEditForm } from "@/components/admin/CampaignEditForm";
import { CampaignActions } from "@/components/admin/CampaignActions";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignEditPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return (
        <AdminLayout userEmail={session.user?.email}>
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-red-200">
              <div className="text-5xl mb-3">❌</div>
              <h1 className="text-2xl font-bold text-red-600">Campaign Not Found</h1>
              <p className="text-gray-600 mt-2">The campaign you're looking for doesn't exist.</p>
              <Link
                href="/admin/dashboard"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Back to Dashboard
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userEmail={session.user?.email}>
      <div className="max-w-3xl">
        <Link
          href="/admin/dashboard"
          className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 mb-6"
        >
          ← Back to Campaigns
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{campaign.offerName}</h1>
            <p className="text-gray-600 mt-1">Configure campaign settings and auto-trigger behavior</p>
          </div>

          {/* Quick Actions */}
          <CampaignActions campaign={campaign} />
          
          <CampaignEditForm campaign={campaign} />
        </div>
      </div>
    </AdminLayout>
    );
  } catch (error) {
    console.error("Campaign edit page error:", error);
    throw error;
  }
}
