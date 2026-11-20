"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  PenSquare,
} from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { ThemeToggle } from "./ThemeToggle";
import { useToast } from "./ToastProvider";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/news", label: "Kelola Berita", icon: Newspaper },
  { href: "/admin/news/new", label: "Tulis Berita", icon: PenSquare },
  { href: "/admin/categories", label: "Kategori", icon: FolderKanban },
];

export function AdminShell({
  user,
  children,
}: {
  user: SessionPayload;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    showToast("Berhasil logout", "info");
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-w-0">
        {/* Topbar */}
        <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-30 px-4">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="admin-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost btn-sm"
            >
              <Menu className="size-5" />
            </label>
          </div>
          <div className="flex-1 px-2">
            <span className="font-bold text-base sm:text-lg">
              Editorial Studio
            </span>
          </div>
          <div className="flex-none flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="btn btn-ghost btn-sm gap-1.5"
            >
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">Lihat Portal</span>
            </Link>
            <ThemeToggle compact />
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm gap-2"
              >
                <div className="avatar avatar-placeholder">
                  <div className="bg-primary text-primary-content w-7 rounded-full text-xs font-bold">
                    <span>{user.fullname.slice(0, 2).toUpperCase()}</span>
                  </div>
                </div>
                <span className="hidden md:inline font-medium text-sm">
                  {user.fullname}
                </span>
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[50] mt-2 w-52 p-2 shadow-xl border border-base-300"
              >
                <li className="menu-title">
                  <span>@{user.username}</span>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-error"
                  >
                    <LogOut className="size-4" />
                    Keluar
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40">
        <label
          htmlFor="admin-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <aside className="bg-base-100 border-r border-base-300 min-h-full w-64 flex flex-col justify-between p-4">
          <div className="space-y-6">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-2 font-black text-xl"
            >
              <span className="bg-primary text-primary-content p-1.5 rounded-lg">
                <Newspaper className="size-5" />
              </span>
              <span>
                AB<span className="text-primary">News</span>
              </span>
            </Link>

            <ul className="menu w-full gap-1 p-0">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={active ? "menu-active font-semibold" : ""}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card bg-base-200 border border-base-300">
            <div className="card-body p-3 gap-2">
              <div className="text-xs text-base-content/70">
                Masuk sebagai <strong>{user.username}</strong>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline btn-error btn-xs w-full gap-1.5"
              >
                <LogOut className="size-3.5" />
                Logout
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
