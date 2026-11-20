import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  Eye,
  FileText,
  FolderOpen,
  Newspaper,
  PenSquare,
  TrendingUp,
} from "lucide-react";
import { getDashboardStats } from "@/lib/data";
import { formatDateID } from "@/lib/utils";

async function DashboardContent() {
  await connection();
  const stats = await getDashboardStats();
  const maxCatCount = Math.max(1, ...stats.categories.map((c) => c.newsCount));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dashboard Redaksi
          </h1>
          <p className="text-sm text-base-content/65">
            Ringkasan performa konten dan aktivitas berita
          </p>
        </div>
        <Link href="/admin/news/new" className="btn btn-primary gap-2">
          <PenSquare className="size-4" />
          Tulis Berita Baru
        </Link>
      </div>

      {/* Stats */}
      <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-100 border border-base-300 w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <Newspaper className="size-8" />
          </div>
          <div className="stat-title">Total Berita</div>
          <div className="stat-value text-primary">{stats.totalNews}</div>
          <div className="stat-desc">
            {stats.publishedNews} tayang &bull; {stats.draftNews} draft
          </div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <FolderOpen className="size-8" />
          </div>
          <div className="stat-title">Total Kategori</div>
          <div className="stat-value text-secondary">
            {stats.totalCategories}
          </div>
          <div className="stat-desc">Topik berita aktif</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-accent">
            <Eye className="size-8" />
          </div>
          <div className="stat-title">Total Tayangan</div>
          <div className="stat-value text-accent">
            {stats.totalViews.toLocaleString("id-ID")}
          </div>
          <div className="stat-desc">Akumulasi pembaca artikel</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-info">
            <FileText className="size-8" />
          </div>
          <div className="stat-title">Rasio Publikasi</div>
          <div className="stat-value">
            {stats.totalNews > 0
              ? Math.round((stats.publishedNews / stats.totalNews) * 100)
              : 0}
            %
          </div>
          <div className="stat-desc">Berita berstatus published</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Articles */}
        <div className="lg:col-span-7 card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-lg flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Berita Terpopuler
              </h2>
              <Link href="/admin/news" className="btn btn-ghost btn-xs">
                Lihat Semua
              </Link>
            </div>

            {stats.topNews.length === 0 ? (
              <p className="text-sm text-base-content/60 py-6 text-center">
                Belum ada berita.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Judul</th>
                      <th>Kategori</th>
                      <th>Views</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topNews.map((item) => (
                      <tr key={item.id_news} className="hover">
                        <td className="max-w-xs">
                          <div className="font-semibold line-clamp-1">
                            {item.title}
                          </div>
                          <div className="text-xs text-base-content/50">
                            {formatDateID(item.created_at)}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-ghost badge-sm">
                            {item.category}
                          </span>
                        </td>
                        <td className="font-mono font-semibold">{item.views}</td>
                        <td>
                          <Link
                            href={`/admin/news/${item.id_news}/edit`}
                            className="btn btn-ghost btn-xs"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-lg">Distribusi Kategori</h2>
              <Link href="/admin/categories" className="btn btn-ghost btn-xs">
                Kelola
              </Link>
            </div>

            {stats.categories.length === 0 ? (
              <p className="text-sm text-base-content/60 py-6 text-center">
                Belum ada kategori.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.categories.map((cat) => (
                  <div key={cat.id_category_news} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{cat.category}</span>
                      <span className="text-base-content/60 font-mono">
                        {cat.newsCount} berita
                      </span>
                    </div>
                    <progress
                      className="progress progress-primary w-full"
                      value={cat.newsCount}
                      max={maxCatCount}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="skeleton h-10 w-64" />
          <div className="skeleton h-28 w-full rounded-box" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="skeleton h-64 rounded-box" />
            <div className="skeleton h-64 rounded-box" />
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
