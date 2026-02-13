import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/AdminLayout";
import { NewCampaignForm } from "@/components/admin/NewCampaignForm";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <AdminLayout userEmail={session.user?.email}>
      <div className="max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
            <p className="text-gray-600 mt-1">Set up a new prelander campaign with offer details</p>
          </div>

          <NewCampaignForm />
        </div>
      </div>
    </AdminLayout>
  );
}
