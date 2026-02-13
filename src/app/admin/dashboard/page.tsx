import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: {
          select: { clickSessions: true, conversions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalClicks = campaigns.reduce(
      (sum, c) => sum + c._count.clickSessions,
      0,
    );
    const totalConversions = campaigns.reduce(
      (sum, c) => sum + c._count.conversions,
      0,
    );

    const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : "0.00";

    // Transform campaigns data for client component
    const campaignData = campaigns.map((campaign) => ({
      id: campaign.id,
      offerName: campaign.offerName,
      status: campaign.status,
      subdomain: campaign.subdomain,
      autoTriggerOnInaction: campaign.autoTriggerOnInaction,
      autoTriggerDelay: campaign.autoTriggerDelay,
      clickCount: campaign._count.clickSessions,
      conversionCount: campaign._count.conversions,
    }));

    return (
      <AdminDashboardClient
        userEmail={session.user?.email}
        campaigns={campaignData}
        totalClicks={totalClicks}
        totalConversions={totalConversions}
        activeCampaigns={activeCampaigns}
        conversionRate={conversionRate}
      />
    );
  } catch (error) {
    console.error("Admin dashboard error:", error);
    throw error;
  }
}
