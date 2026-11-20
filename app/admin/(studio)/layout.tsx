import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { AdminShell } from "@/components/AdminShell";

async function AuthenticatedStudio({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return <AdminShell user={session}>{children}</AdminShell>;
}

export default function AdminStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <AuthenticatedStudio>{children}</AuthenticatedStudio>
    </Suspense>
  );
}
