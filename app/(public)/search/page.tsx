import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Search } from "lucide-react";
import { getCategories, getNewsList } from "@/lib/data";
import { NewsCard } from "@/components/NewsCard";
import { Pagination } from "@/components/Pagination";

async function SearchContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{
    q?: string;
    categoryId?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  await connection();
  const sp = await searchParamsPromise;
  const query = sp.q?.trim() ?? "";
  const categoryId = sp.categoryId ? Number(sp.categoryId) : undefined;
  const sort = sp.sort === "popular" ? "popular" : "latest";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const [categories, results] = await Promise.all([
    getCategories(),
    getNewsList({ query, categoryId, sort, page, limit: 12 }),
  ]);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categoryId) params.set("categoryId", String(categoryId));
    if (sort !== "latest") params.set("sort", sort);
    params.set("page", String(p));
    return `/search?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body p-6 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <Search className="size-6 text-primary" />
            Jelajahi & Cari Berita
          </h1>

          <form action="/search" method="GET" className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Cari judul atau isi berita..."
              className="input input-bordered md:col-span-6 w-full"
            />
            <select
              name="categoryId"
              defaultValue={categoryId ? String(categoryId) : ""}
              className="select select-bordered md:col-span-3 w-full"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id_category_news} value={c.id_category_news}>
                  {c.category} ({c.newsCount})
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sort}
              className="select select-bordered md:col-span-2 w-full"
            >
              <option value="latest">Terbaru</option>
              <option value="popular">Terpopuler</option>
            </select>
            <button type="submit" className="btn btn-primary md:col-span-1">
              Cari
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-base-content/70">
        <span>
          Menampilkan <strong>{results.items.length}</strong> dari{" "}
          <strong>{results.pagination.total}</strong> berita
          {query ? ` untuk "${query}"` : ""}
        </span>
        {(query || categoryId) && (
          <Link href="/search" className="link link-primary">
            Reset Filter
          </Link>
        )}
      </div>

      {results.items.length === 0 ? (
        <div className="hero bg-base-200/50 rounded-box border border-base-300 py-14">
          <div className="hero-content text-center">
            <div className="max-w-md space-y-3">
              <h2 className="text-xl font-bold">Tidak ada berita ditemukan</h2>
              <p className="text-sm text-base-content/70">
                Coba gunakan kata kunci lain atau pilih kategori yang berbeda.
              </p>
              <Link href="/search" className="btn btn-primary btn-sm">
                Tampilkan Semua Berita
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.items.map((item) => (
            <NewsCard key={item.id_news} item={item} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={results.pagination.page}
        totalPages={results.pagination.totalPages}
        buildHref={buildHref}
      />
    </div>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="skeleton h-32 w-full rounded-box" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-72 rounded-box" />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent searchParamsPromise={searchParams} />
    </Suspense>
  );
}
