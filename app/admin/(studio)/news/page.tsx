"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ExternalLink,
  Pencil,
  PenSquare,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { CategorySummary, NewsSummary } from "@/lib/data";
import { formatDateID } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

export default function AdminNewsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<NewsSummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<NewsSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const buildNewsUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      status,
    });
    if (query.trim()) params.set("q", query.trim());
    if (categoryId) params.set("categoryId", categoryId);
    return `/api/news?${params.toString()}`;
  }, [page, query, categoryId, status]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(buildNewsUrl());
      const data = await res.json();
      setItems(data.items ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setSelectedIds([]);
    } catch {
      showToast("Gagal memuat daftar berita", "error");
    } finally {
      setLoading(false);
    }
  }, [buildNewsUrl, showToast]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(buildNewsUrl())
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setItems(data.items ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setSelectedIds([]);
      })
      .catch(() => {
        if (!cancelled) showToast("Gagal memuat daftar berita", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [buildNewsUrl, showToast]);

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id_news));
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSingle = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/news/${deleteTarget.id_news}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        showToast("Gagal menghapus berita", "error");
        return;
      }
      showToast("Berita berhasil dihapus", "success");
      setDeleteTarget(null);
      fetchNews();
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/news", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) {
        showToast("Gagal menghapus berita terpilih", "error");
        return;
      }
      showToast(`${selectedIds.length} berita dihapus`, "success");
      fetchNews();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Kelola Berita
          </h1>
          <p className="text-sm text-base-content/65">
            Cari, filter, edit, atau hapus artikel berita
          </p>
        </div>
        <Link href="/admin/news/new" className="btn btn-primary gap-2">
          <PenSquare className="size-4" />
          Tulis Berita
        </Link>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4 flex-row flex-wrap items-center gap-3">
          <label className="input input-bordered input-sm flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="size-4 opacity-60" />
            <input
              type="search"
              placeholder="Cari judul berita..."
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
            />
          </label>

          <select
            className="select select-bordered select-sm"
            value={categoryId}
            onChange={(e) => {
              setPage(1);
              setCategoryId(e.target.value);
            }}
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id_category_news} value={c.id_category_news}>
                {c.category}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered select-sm"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="all">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={deleting}
              className="btn btn-error btn-sm gap-1.5"
            >
              <Trash2 className="size-3.5" />
              Hapus ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={
                      items.length > 0 && selectedIds.length === items.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Berita</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Views</th>
                <th>Tanggal</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-base-content/60"
                  >
                    Tidak ada berita ditemukan.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id_news} className="hover">
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={selectedIds.includes(item.id_news)}
                        onChange={() => toggleOne(item.id_news)}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-16 bg-base-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.imageUrl} alt={item.title} />
                          </div>
                        </div>
                        <div className="max-w-xs">
                          <div className="font-bold line-clamp-1 flex items-center gap-1.5">
                            {item.is_featured && (
                              <Sparkles className="size-3.5 text-warning shrink-0" />
                            )}
                            <span>{item.title}</span>
                          </div>
                          <div className="text-xs text-base-content/50">
                            ID #{item.id_news}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline badge-sm">
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm ${
                          item.status === "published"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="font-mono text-sm">{item.views}</td>
                    <td className="text-xs text-base-content/70">
                      {formatDateID(item.created_at)}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/news/${item.id_news}`}
                          target="_blank"
                          className="btn btn-ghost btn-xs btn-square"
                          title="Lihat di Portal"
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                        <Link
                          href={`/admin/news/${item.id_news}/edit`}
                          className="btn btn-ghost btn-xs btn-square text-info"
                          title="Edit"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="btn btn-ghost btn-xs btn-square text-error"
                          title="Hapus"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="join">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`join-item btn btn-sm ${
                  p === page ? "btn-primary" : ""
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Hapus Berita?</h3>
            <p className="py-4 text-sm">
              Anda yakin ingin menghapus berita{" "}
              <strong>&quot;{deleteTarget.title}&quot;</strong>? Tindakan ini
              tidak dapat dibatalkan.
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDeleteTarget(null)}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteSingle}
                className="btn btn-error btn-sm"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setDeleteTarget(null)}
          />
        </dialog>
      )}
    </div>
  );
}
