import { Suspense } from "react";
import { connection } from "next/server";
import { getCategories } from "@/lib/data";
import { NewsEditorForm } from "@/components/NewsEditorForm";

async function NewNewsContent() {
  await connection();
  const categories = await getCategories();
  return <NewsEditorForm categories={categories} />;
}

export default function NewNewsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="skeleton h-10 w-56" />
          <div className="skeleton h-96 w-full rounded-box" />
        </div>
      }
    >
      <NewNewsContent />
    </Suspense>
  );
}
