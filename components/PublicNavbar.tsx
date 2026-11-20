"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  ChevronDown,
  LayoutDashboard,
  Menu,
  Newspaper,
  Search,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { getBookmarks } from "@/lib/bookmarks";

interface NavCategory {
  id_category_news: number;
  category: string;
  newsCount: number;
}

export function PublicNavbar({ categories }: { categories: NavCategory[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const searchDialogRef = useRef<HTMLDialogElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => setBookmarkCount(getBookmarks().length);
    sync();
    window.addEventListener("abnews-bookmarks-changed", sync);
    return () => window.removeEventListener("abnews-bookmarks-changed", sync);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchDialogRef.current?.showModal();
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    searchDialogRef.current?.close();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-base-100/90 backdrop-blur-md border-b border-base-300">
        <div className="navbar max-w-7xl mx-auto px-4">
          <div className="navbar-start gap-2">
            <div className="dropdown lg:hidden">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-square btn-sm"
                aria-label="Menu"
              >
                <Menu className="size-5" />
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[60] mt-3 w-60 p-2 shadow-xl border border-base-300"
              >
                <li>
                  <Link href="/">Beranda</Link>
                </li>
                <li>
                  <Link href="/search">Jelajahi Berita</Link>
                </li>
                <li>
                  <Link href="/bookmarks">Tersimpan ({bookmarkCount})</Link>
                </li>
                <li className="menu-title mt-2">Kategori</li>
                {categories.map((c) => (
                  <li key={c.id_category_news}>
                    <Link
                      href={`/category/${c.id_category_news}`}
                      className="justify-between"
                    >
                      <span>{c.category}</span>
                      <span className="badge badge-ghost badge-xs">
                        {c.newsCount}
                      </span>
                    </Link>
                  </li>
                ))}
                <li className="mt-2 pt-2 border-t border-base-200">
                  <Link href="/admin" className="text-primary font-semibold">
                    Admin Studio
                  </Link>
                </li>
              </ul>
            </div>

            <Link
              href="/"
              className="btn btn-ghost px-2 text-xl font-black tracking-tight gap-2"
            >
              <span className="bg-primary text-primary-content p-1.5 rounded-lg">
                <Newspaper className="size-5" />
              </span>
              <span>
                AB<span className="text-primary">News</span>
              </span>
            </Link>
          </div>

          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-1 font-medium">
              <li>
                <Link href="/">Beranda</Link>
              </li>
              <li>
                <div className="dropdown dropdown-hover">
                  <div tabIndex={0} role="button" className="flex items-center gap-1">
                    Kategori <ChevronDown className="size-3.5" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-box z-[60] w-56 p-2 shadow-xl border border-base-300"
                  >
                    {categories.length === 0 ? (
                      <li className="disabled">
                        <span>Belum ada kategori</span>
                      </li>
                    ) : (
                      categories.map((c) => (
                        <li key={c.id_category_news}>
                          <Link
                            href={`/category/${c.id_category_news}`}
                            className="justify-between"
                          >
                            <span>{c.category}</span>
                            <span className="badge badge-sm badge-ghost">
                              {c.newsCount}
                            </span>
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </li>
              <li>
                <Link href="/search">Semua Berita</Link>
              </li>
            </ul>
          </div>

          <div className="navbar-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                searchDialogRef.current?.showModal();
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="btn btn-ghost btn-sm gap-2 border border-base-300 bg-base-200/60"
            >
              <Search className="size-4" />
              <span className="hidden md:inline text-base-content/60 font-normal">
                Cari berita...
              </span>
              <kbd className="kbd kbd-xs hidden md:inline-flex">Ctrl K</kbd>
            </button>

            <Link
              href="/bookmarks"
              className="btn btn-ghost btn-sm btn-square indicator"
              title="Berita Tersimpan"
              aria-label="Berita Tersimpan"
            >
              {bookmarkCount > 0 && (
                <span className="indicator-item badge badge-primary badge-xs">
                  {bookmarkCount}
                </span>
              )}
              <Bookmark className="size-4" />
            </Link>

            <ThemeToggle compact />

            <Link
              href="/admin"
              className="btn btn-primary btn-sm gap-1.5 hidden sm:inline-flex"
            >
              <LayoutDashboard className="size-4" />
              <span>Studio</span>
            </Link>
          </div>
        </div>
      </header>

      <dialog ref={searchDialogRef} className="modal modal-top sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Search className="size-5 text-primary" />
            Cari Berita
          </h3>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Ketik judul atau kata kunci..."
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Cari
            </button>
          </form>
          {categories.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">
                Kategori Populer
              </p>
              <div className="flex flex-wrap gap-1.5">
                {categories.slice(0, 6).map((c) => (
                  <Link
                    key={c.id_category_news}
                    href={`/category/${c.id_category_news}`}
                    onClick={() => searchDialogRef.current?.close()}
                    className="badge badge-outline hover:badge-primary transition-colors py-3 px-3"
                  >
                    {c.category}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
