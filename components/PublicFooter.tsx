import Link from "next/link";
import { Newspaper } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="footer sm:footer-horizontal bg-base-200 text-base-content border-t border-base-300 mt-auto px-6 py-10">
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between gap-6">
        <aside className="max-w-sm">
          <div className="flex items-center gap-2 font-black text-xl mb-2">
            <span className="bg-primary text-primary-content p-1.5 rounded-lg">
              <Newspaper className="size-5" />
            </span>
            <span>
              AB<span className="text-primary">News</span>
            </span>
          </div>
          <p className="text-sm text-base-content/70">
            Portal berita modern dengan pengalaman baca cepat, bersih, dan
            nyaman di mode terang maupun gelap.
          </p>
        </aside>
        <div className="flex flex-wrap gap-10">
          <nav className="flex flex-col gap-1.5 text-sm">
            <h6 className="footer-title">Navigasi</h6>
            <Link href="/" className="link link-hover">
              Beranda
            </Link>
            <Link href="/search" className="link link-hover">
              Semua Berita
            </Link>
            <Link href="/bookmarks" className="link link-hover">
              Berita Tersimpan
            </Link>
          </nav>
          <nav className="flex flex-col gap-1.5 text-sm">
            <h6 className="footer-title">Redaksi</h6>
            <Link href="/admin" className="link link-hover">
              Admin Studio
            </Link>
            <Link href="/admin/news/new" className="link link-hover">
              Tulis Berita
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
