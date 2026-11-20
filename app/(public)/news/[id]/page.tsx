import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft, Calendar, Clock, Eye, Pencil } from "lucide-react";
import { getNewsById, getRelatedNews } from "@/lib/data";
import { getSession } from "@/lib/session";
import {
  estimateReadingTime,
  formatDateLongID,
  renderArticleContent,
} from "@/lib/utils";
import { ArticleReaderTools } from "@/components/ArticleReaderTools";
import { NewsCard } from "@/components/NewsCard";

async function NewsDetailContent({
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

  const [item, session] = await Promise.all([
    getNewsById(newsId, true),
    getSession(),
  ]);

  if (!item || (item.status !== "published" && !session)) {
    notFound();
  }

  const related = await getRelatedNews(item.id_category_news, item.id_news, 3);
  const readingTime = estimateReadingTime(item.content);
  const htmlContent = renderArticleContent(item.content);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href="/">Beranda</Link>
            </li>
            <li>
              <Link href={`/category/${item.id_category_news}`}>
                {item.category}
              </Link>
            </li>
            <li className="text-base-content/60 max-w-xs truncate">
              {item.title}
            </li>
          </ul>
        </div>

        {session && (
          <Link
            href={`/admin/news/${item.id_news}/edit`}
            className="btn btn-sm btn-outline btn-primary gap-1.5"
          >
            <Pencil className="size-3.5" />
            Edit di Studio
          </Link>
        )}
      </div>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/category/${item.id_category_news}`}
            className="badge badge-primary font-semibold"
          >
            {item.category}
          </Link>
          {item.status === "draft" && (
            <span className="badge badge-warning font-semibold">Draft</span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
          {item.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-base-300">
          <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatDateLongID(item.created_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" />
              {readingTime} menit baca
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4" />
              {item.views} kali dibaca
            </span>
          </div>

          <ArticleReaderTools
            id_news={item.id_news}
            title={item.title}
            category={item.category}
            imageUrl={item.imageUrl}
          />
        </div>
      </header>

      {/* Cover Image */}
      <figure className="rounded-box overflow-hidden border border-base-300 bg-base-200 aspect-[16/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </figure>

      {/* Body */}
      <div
        id="article-body"
        className="article-content text-base leading-relaxed text-base-content/90"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Back Link */}
      <div className="pt-4 border-t border-base-300">
        <Link href="/" className="btn btn-ghost gap-2">
          <ArrowLeft className="size-4" />
          Kembali ke Beranda
        </Link>
      </div>

      {/* Related News */}
      {related.length > 0 && (
        <section className="pt-8 border-t border-base-300 space-y-5">
          <h2 className="text-2xl font-black tracking-tight">
            Berita Terkait di {item.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((rel) => (
              <NewsCard key={rel.id_news} item={rel} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export default function ReadNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="skeleton h-6 w-64" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-80 w-full rounded-box" />
          <div className="skeleton h-40 w-full" />
        </div>
      }
    >
      <NewsDetailContent paramsPromise={params} />
    </Suspense>
  );
}
