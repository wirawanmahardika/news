import { Suspense } from "react";
import { connection } from "next/server";
import { getCategories } from "@/lib/data";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";

async function NavbarWithCategories() {
  await connection();
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }
  return <PublicNavbar categories={categories} />;
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Suspense
        fallback={
          <div className="navbar bg-base-100 border-b border-base-300 h-16 px-4">
            <div className="skeleton h-8 w-32" />
          </div>
        }
      >
        <NavbarWithCategories />
      </Suspense>
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
