import Link from "next/link";
import { Clock, Eye, Sparkles } from "lucide-react";
import { createExcerpt, estimateReadingTime, formatDateID } from "@/lib/utils";
import type { NewsSummary } from "@/lib/data";

export function NewsCard({ item }: { item: NewsSummary }) {
  const readingTime = estimateReadingTime(item.content);
  const excerpt = createExcerpt(item.content, item.excerpt, 120);

  return (
    <Link
      href={`/news/${item.id_news}`}
      className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group overflow-hidden"
    >
      <figure className="relative aspect-[16/10] bg-base-200 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="badge badge-primary badge-sm font-semibold shadow">
            {item.category}
          </span>
          {item.is_featured && (
            <span className="badge badge-warning badge-sm gap-1 font-semibold shadow">
              <Sparkles className="size-3" />
              Pilihan
            </span>
          )}
        </div>
      </figure>
      <div className="card-body p-5 gap-2.5">
        <h3 className="card-title text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-base-content/70 line-clamp-2">{excerpt}</p>
        <div className="card-actions justify-between items-center pt-2 mt-auto border-t border-base-200 text-xs text-base-content/60">
          <span>{formatDateID(item.created_at)}</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {readingTime} mnt
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" />
              {item.views}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
