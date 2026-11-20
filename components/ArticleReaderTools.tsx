"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Bookmark, BookmarkCheck, Share2, Type } from "lucide-react";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";
import { useToast } from "./ToastProvider";

interface ArticleReaderToolsProps {
  id_news: number;
  title: string;
  category: string;
  imageUrl: string;
}

function subscribeBookmarks(callback: () => void) {
  window.addEventListener("abnews-bookmarks-changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("abnews-bookmarks-changed", callback);
    window.removeEventListener("storage", callback);
  };
}

export function ArticleReaderTools({
  id_news,
  title,
  category,
  imageUrl,
}: ArticleReaderToolsProps) {
  const { showToast } = useToast();
  const saved = useSyncExternalStore(
    subscribeBookmarks,
    () => isBookmarked(id_news),
    () => false
  );
  const [progress, setProgress] = useState(0);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      if (scrollHeight > 0) {
        setProgress(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const articleEl = document.getElementById("article-body");
    if (articleEl) {
      articleEl.classList.toggle("text-lg", largeText);
      articleEl.classList.toggle("text-base", !largeText);
    }
  }, [largeText]);

  const handleBookmark = () => {
    const nowSaved = toggleBookmark({
      id_news,
      title,
      category,
      imageUrl,
      savedAt: new Date().toISOString(),
    });
    showToast(
      nowSaved
        ? "Berita disimpan ke daftar baca"
        : "Berita dihapus dari daftar baca",
      nowSaved ? "success" : "info"
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    showToast("Tautan berita disalin ke clipboard", "success");
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent pointer-events-none">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setLargeText((v) => !v)}
          className={`btn btn-sm gap-1.5 ${
            largeText ? "btn-primary" : "btn-outline"
          }`}
          title="Ubah ukuran teks"
        >
          <Type className="size-4" />
          <span>{largeText ? "Teks Besar" : "Teks Normal"}</span>
        </button>

        <button
          type="button"
          onClick={handleBookmark}
          className={`btn btn-sm gap-1.5 ${
            saved ? "btn-secondary" : "btn-outline"
          }`}
        >
          {saved ? (
            <BookmarkCheck className="size-4" />
          ) : (
            <Bookmark className="size-4" />
          )}
          <span>{saved ? "Tersimpan" : "Simpan"}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="btn btn-sm btn-outline gap-1.5"
        >
          <Share2 className="size-4" />
          <span>Bagikan</span>
        </button>
      </div>
    </>
  );
}
