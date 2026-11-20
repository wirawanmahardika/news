import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ArrowRight,
  Clock,
  Eye,
  Flame,
  FolderOpen,
  Newspaper,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getCategories, getNewsList } from "@/lib/data";
import { createExcerpt, estimateReadingTime, formatDateID } from "@/lib/utils";
import { NewsCard } from "@/components/NewsCard";

function HomeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <div className="skeleton h-80 w-full rounded-box" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-36 rounded-box" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-72 rounded-box" />
        ))}
      </div>
    </div>
  );
}

async function HomeContent() {
  await connection();
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let latestItems: Awaited<ReturnType<typeof getNewsList>>["items"] = [];
  let popularItems: Awaited<ReturnType<typeof getNewsList>>["items"] = [];
  let featuredItems: Awaited<ReturnType<typeof getNewsList>>["items"] = [];
  let dbError = false;

  try {
    const [cats, latest, popular, featured] = await Promise.all([
      getCategories(),
      getNewsList({ limit: 8, sort: "latest" }),
      getNewsList({ limit: 6, sort: "popular" }),
      getNewsList({ limit: 1, featuredOnly: true, sort: "latest" }),
    ]);
    categories = cats;
    latestItems = latest.items;
    popularItems = popular.items;
    featuredItems = featured.items;
  } catch {
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="alert alert-warning shadow-lg">
          <div>
            <h3 className="font-bold text-lg">Database Belum Terhubung</h3>
            <p className="text-sm mt-1">
              Pastikan <code className="badge badge-neutral">DATABASE_URL</code>{" "}
              sudah dikonfigurasi di <code className="font-mono">.env</code> dan
              jalankan <code className="font-mono">bun run db:push</code>.
            </p>
          </div>
          <Link href="/admin" className="btn btn-sm btn-primary">
            Buka Admin Studio
          </Link>
        </div>
      </div>
    );
  }

  const heroArticle = featuredItems[0] ?? latestItems[0] ?? null;
  const remainingLatest = heroArticle
    ? latestItems.filter((n) => n.id_news !== heroArticle.id_news)
    : latestItems;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">
      {/* Breaking Ticker */}
      {latestItems.length > 0 && (
        <div className="bg-base-200 border border-base-300 rounded-box px-4 py-2.5 flex items-center gap-3 overflow-hidden">
          <span className="badge badge-error badge-sm gap-1 font-bold shrink-0 animate-pulse">
            <Flame className="size-3" />
            TERKINI
          </span>
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar text-sm">
            {latestItems.slice(0, 4).map((n) => (
              <Link
                key={n.id_news}
                href={`/news/${n.id_news}`}
                className="link link-hover whitespace-nowrap font-medium text-base-content/80 hover:text-primary"
              >
                {n.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hero Featured Story */}
      {heroArticle ? (
        <section>
          <div className="card lg:card-side bg-base-200/70 border border-base-300 shadow-xl overflow-hidden">
            <figure className="lg:w-7/12 relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] bg-base-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroArticle.imageUrl}
                alt={heroArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="badge badge-primary font-semibold shadow">
                  {heroArticle.category}
                </span>
                <span className="badge badge-warning gap-1 font-semibold shadow">
                  <Sparkles className="size-3" />
                  Sorotan Utama
                </span>
              </div>
            </figure>
            <div className="card-body lg:w-5/12 justify-between p-6 sm:p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs text-base-content/60 font-medium">
                  <span>{formatDateID(heroArticle.created_at)}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {estimateReadingTime(heroArticle.content)} mnt baca
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3.5" />
                    {heroArticle.views} dibaca
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                  {heroArticle.title}
                </h1>
                <p className="text-base-content/75 leading-relaxed">
                  {createExcerpt(heroArticle.content, heroArticle.excerpt, 200)}
                </p>
              </div>
              <div className="card-actions pt-4">
                <Link
                  href={`/news/${heroArticle.id_news}`}
                  className="btn btn-primary gap-2"
                >
                  Baca Selengkapnya
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="hero bg-base-200 rounded-box border border-base-300 py-16">
          <div className="hero-content text-center">
            <div className="max-w-md space-y-4">
              <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary">
                <Newspaper className="size-10" />
              </div>
              <h1 className="text-3xl font-black">Selamat Datang di ABNews</h1>
              <p className="text-base-content/70">
                Belum ada berita yang dipublikasikan. Masuk ke Admin Studio
                untuk membuat kategori dan menulis berita pertama Anda.
              </p>
              <Link href="/admin" className="btn btn-primary">
                Buka Admin Studio
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Showcase */}
      {categories.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <FolderOpen className="size-6 text-primary" />
                Kategori Berita
              </h2>
              <p className="text-sm text-base-content/60">
                Jelajahi topik berita berdasarkan minat Anda
              </p>
            </div>
            <Link href="/search" className="btn btn-ghost btn-sm gap-1">
              Semua <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id_category_news}
                href={`/category/${cat.id_category_news}`}
                className="card image-full h-36 sm:h-44 shadow-md hover:shadow-xl transition-all group overflow-hidden border border-base-300"
              >
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.imageUrl}
                    alt={cat.category}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </figure>
                <div className="card-body justify-end p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <h3 className="card-title text-white text-base sm:text-lg font-bold">
                        {cat.category}
                      </h3>
                      {cat.description && (
                        <p className="text-xs text-white/75 line-clamp-1">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <span className="badge badge-primary badge-sm shrink-0">
                      {cat.newsCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest & Popular News */}
      {latestItems.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">
                Berita Terkini
              </h2>
              <Link href="/search" className="btn btn-outline btn-sm gap-1">
                Lihat Semua <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {(remainingLatest.length > 0 ? remainingLatest : latestItems)
                .slice(0, 6)
                .map((item) => (
                  <NewsCard key={item.id_news} item={item} />
                ))}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-5">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <TrendingUp className="size-6 text-secondary" />
              Terpopuler
            </h2>
            <div className="card bg-base-200/60 border border-base-300">
              <div className="card-body p-4 divide-y divide-base-300">
                {popularItems.map((item, idx) => (
                  <Link
                    key={item.id_news}
                    href={`/news/${item.id_news}`}
                    className="py-3 first:pt-1 last:pb-1 flex items-start gap-3 group"
                  >
                    <span className="text-2xl font-black text-primary/40 group-hover:text-primary transition-colors w-7 shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <span className="badge badge-ghost badge-xs">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-base-content/60">
                        <span>{formatDateID(item.created_at)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="size-3" />
                          {item.views}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
