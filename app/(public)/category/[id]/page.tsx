import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { FolderOpen } from "lucide-react";
import { getCategoryById, getNewsList } from "@/lib/data";
import { NewsCard } from "@/components/NewsCard";
import { Pagination } from "@/components/Pagination";

async function CategoryContent({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
  searchParamsPromise: Promise<{ page?: string; sort?: string }>;
}) {
  await connection();
  const [{ id }, sp] = await Promise.all([paramsPromise, searchParamsPromise]);
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    notFound();
  }

  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const sort = sp.sort === "popular" ? "popular" : "latest";

  const [category, newsData] = await Promise.all([
    getCategoryById(categoryId),
    getNewsList({ categoryId, page, limit: 12, sort }),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Category Header */}
      <div className="card image-full h-52 sm:h-64 rounded-box overflow-hidden border border-base-300 shadow-lg">
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.imageUrl}
            alt={category.category}
            className="w-full h-full object-cover"
          />
        </figure>
        <div className="card-body justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="badge badge-primary gap-1">
                <FolderOpen className="size-3.5" />
                Kategori
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                {category.category}
              </h1>
              {category.description && (
                <p className="text-white/80 max-w-2xl text-sm sm:text-base">
                  {category.description}
                </p>
              )}
            </div>
            <div className="badge badge-lg badge-neutral">
              {newsData.pagination.total} Berita
            </div>
          </div>
        </div>
      </div>

      {/* Sort Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href="/">Beranda</Link>
            </li>
            <li>{category.category}</li>
          </ul>
        </div>
        <div className="join">
          <Link
            href={`/category/${categoryId}?sort=latest`}
            className={`join-item btn btn-sm ${
              sort === "latest" ? "btn-primary" : "btn-outline"
            }`}
          >
            Terbaru
          </Link>
          <Link
            href={`/category/${categoryId}?sort=popular`}
            className={`join-item btn btn-sm ${
              sort === "popular" ? "btn-primary" : "btn-outline"
            }`}
          >
            Terpopuler
          </Link>
        </div>
      </div>

      {/* Grid */}
      {newsData.items.length === 0 ? (
        <div className="alert bg-base-200 border border-base-300 py-10 justify-center">
          <span>Belum ada berita dalam kategori ini.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsData.items.map((item) => (
            <NewsCard key={item.id_news} item={item} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={newsData.pagination.page}
        totalPages={newsData.pagination.totalPages}
        buildHref={(p) => `/category/${categoryId}?sort=${sort}&page=${p}`}
      />
    </div>
  );
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="skeleton h-56 w-full rounded-box" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-72 rounded-box" />
            ))}
          </div>
        </div>
      }
    >
      <CategoryContent
        paramsPromise={params}
        searchParamsPromise={searchParams}
      />
    </Suspense>
  );
}
