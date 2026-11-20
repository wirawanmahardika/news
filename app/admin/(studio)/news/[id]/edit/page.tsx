import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { getCategories, getNewsById } from "@/lib/data";
import { NewsEditorForm } from "@/components/NewsEditorForm";

async function EditNewsContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await paramsPromise;
  const newsId = Number(id);
  if (!Number.isInteger(newsId) || newsId <= 0) {
    notFound();
  }

  const [categories, newsItem] = await Promise.all([
    getCategories(),
    getNewsById(newsId, false),
  ]);

  if (!newsItem) {
    notFound();
  }

  return <NewsEditorForm categories={categories} initialData={newsItem} />;
}

export default function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="skeleton h-10 w-56" />
          <div className="skeleton h-96 w-full rounded-box" />
        </div>
      }
    >
      <EditNewsContent paramsPromise={params} />
    </Suspense>
  );
}
