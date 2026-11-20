import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center mt-8">
      <div className="join shadow-sm">
        <Link
          href={buildHref(Math.max(1, currentPage - 1))}
          className={`join-item btn btn-sm ${
            currentPage <= 1 ? "btn-disabled pointer-events-none" : ""
          }`}
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="size-4" />
        </Link>

        {start > 1 && (
          <>
            <Link href={buildHref(1)} className="join-item btn btn-sm">
              1
            </Link>
            {start > 2 && (
              <span className="join-item btn btn-sm btn-disabled">...</span>
            )}
          </>
        )}

        {pages.map((p) => (
          <Link
            key={p}
            href={buildHref(p)}
            className={`join-item btn btn-sm ${
              p === currentPage ? "btn-primary" : ""
            }`}
          >
            {p}
          </Link>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <span className="join-item btn btn-sm btn-disabled">...</span>
            )}
            <Link href={buildHref(totalPages)} className="join-item btn btn-sm">
              {totalPages}
            </Link>
          </>
        )}

        <Link
          href={buildHref(Math.min(totalPages, currentPage + 1))}
          className={`join-item btn btn-sm ${
            currentPage >= totalPages ? "btn-disabled pointer-events-none" : ""
          }`}
          aria-label="Berikutnya"
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
