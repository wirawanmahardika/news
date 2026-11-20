"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import {
  getBookmarks,
  removeBookmark,
  type BookmarkedArticle,
} from "@/lib/bookmarks";
import { formatDateID } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

const EMPTY_BOOKMARKS: BookmarkedArticle[] = [];

let cachedRaw: string | null = null;
let cachedParsed: BookmarkedArticle[] = EMPTY_BOOKMARKS;

function getBookmarksSnapshot(): BookmarkedArticle[] {
  if (typeof window === "undefined") return EMPTY_BOOKMARKS;
  const raw = localStorage.getItem("abnews-bookmarks");
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedParsed = getBookmarks();
  }
  return cachedParsed;
}

function subscribeBookmarks(callback: () => void) {
  window.addEventListener("abnews-bookmarks-changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("abnews-bookmarks-changed", callback);
    window.removeEventListener("storage", callback);
  };
}

export default function BookmarksPage() {
  const { showToast } = useToast();
  const items = useSyncExternalStore(
    subscribeBookmarks,
    getBookmarksSnapshot,
    () => EMPTY_BOOKMARKS
  );

  const handleRemove = (idNews: number) => {
    removeBookmark(idNews);
    showToast("Dihapus dari berita tersimpan", "info");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Bookmark className="size-7 text-primary" />
            Berita Tersimpan
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Daftar bacaan yang Anda simpan di perangkat ini
          </p>
        </div>
        <span className="badge badge-primary badge-lg">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="hero bg-base-200 rounded-box border border-base-300 py-14">
          <div className="hero-content text-center">
            <div className="max-w-md space-y-3">
              <h2 className="text-xl font-bold">Belum ada berita tersimpan</h2>
              <p className="text-sm text-base-content/70">
                Klik tombol &quot;Simpan&quot; saat membaca berita untuk
                menyimpannya di sini.
              </p>
              <Link href="/" className="btn btn-primary btn-sm">
                Jelajahi Berita
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item) => (
            <div
              key={item.id_news}
              className="card card-side bg-base-100 border border-base-300 shadow-sm overflow-hidden"
            >
              <figure className="w-36 shrink-0 bg-base-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body p-4 justify-between">
                <div>
                  <span className="badge badge-primary badge-xs mb-1">
                    {item.category}
                  </span>
                  <Link
                    href={`/news/${item.id_news}`}
                    className="font-bold text-base line-clamp-2 hover:text-primary transition-colors block"
                  >
                    {item.title}
                  </Link>
                </div>
                <div className="flex items-center justify-between text-xs text-base-content/60 pt-2">
                  <span>Disimpan {formatDateID(item.savedAt)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id_news)}
                    className="btn btn-ghost btn-xs text-error gap-1"
                  >
                    <Trash2 className="size-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
