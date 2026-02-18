import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/AdminLayout";

export default async function AdminLayoutRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  return <AdminLayout userEmail={session.user?.email}>{children}</AdminLayout>;
}
