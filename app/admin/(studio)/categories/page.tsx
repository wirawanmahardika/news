"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ExternalLink,
  FolderPlus,
  ImagePlus,
  Pencil,
  Trash2,
} from "lucide-react";
import type { CategorySummary } from "@/lib/data";
import { formatDateID } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategorySummary | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CategorySummary | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      showToast("Gagal memuat kategori", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCategories(data.categories ?? []);
      })
      .catch(() => {
        if (!cancelled) showToast("Gagal memuat kategori", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const openCreateModal = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setImageFile(null);
    setPreviewUrl("");
    setModalOpen(true);
  };

  const openEditModal = (cat: CategorySummary) => {
    setEditing(cat);
    setName(cat.category);
    setDescription(cat.description ?? "");
    setImageFile(null);
    setPreviewUrl(cat.imageUrl);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("category", name);
      formData.append("description", description);
      if (imageFile) {
        formData.append("img", imageFile);
      }

      const url = editing
        ? `/api/categories/${editing.id_category_news}`
        : "/api/categories";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Gagal menyimpan kategori", "error");
        return;
      }

      showToast(
        editing
          ? "Kategori berhasil diperbarui"
          : "Kategori berhasil ditambahkan",
        "success"
      );
      setModalOpen(false);
      fetchCategories();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/categories/${deleteTarget.id_category_news}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        showToast("Gagal menghapus kategori", "error");
        return;
      }
      showToast("Kategori berhasil dihapus", "success");
      setDeleteTarget(null);
      fetchCategories();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Kelola Kategori
          </h1>
          <p className="text-sm text-base-content/65">
            Atur kategori topik berita beserta gambar sampulnya
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary gap-2"
        >
          <FolderPlus className="size-4" />
          Tambah Kategori
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-60 rounded-box" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="hero bg-base-100 rounded-box border border-base-300 py-14">
          <div className="hero-content text-center">
            <div className="max-w-md space-y-3">
              <h2 className="text-xl font-bold">Belum ada kategori</h2>
              <p className="text-sm text-base-content/70">
                Tambahkan kategori pertama agar Anda bisa mulai menerbitkan
                berita.
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="btn btn-primary btn-sm"
              >
                Tambah Kategori
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id_category_news}
              className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden"
            >
              <figure className="relative aspect-[16/9] bg-base-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.imageUrl}
                  alt={cat.category}
                  className="w-full h-full object-cover"
                />
                <span className="badge badge-primary absolute top-3 right-3 font-semibold shadow">
                  {cat.newsCount} Berita
                </span>
              </figure>
              <div className="card-body p-5 gap-2">
                <h3 className="card-title text-lg font-bold">{cat.category}</h3>
                <p className="text-sm text-base-content/70 line-clamp-2 min-h-[2.5rem]">
                  {cat.description || "Tidak ada deskripsi"}
                </p>
                <div className="card-actions justify-between items-center pt-3 border-t border-base-200 mt-auto">
                  <span className="text-xs text-base-content/50">
                    {formatDateID(cat.created_at)}
                  </span>
                  <div className="flex gap-1">
                    <Link
                      href={`/category/${cat.id_category_news}`}
                      target="_blank"
                      className="btn btn-ghost btn-xs btn-square"
                      title="Lihat di Portal"
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="btn btn-ghost btn-xs btn-square text-info"
                      title="Edit"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cat)}
                      className="btn btn-ghost btn-xs btn-square text-error"
                      title="Hapus"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editing ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Nama Kategori</legend>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Contoh: Teknologi, Ekonomi, Olahraga"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Deskripsi (Opsional)
                </legend>
                <textarea
                  rows={2}
                  maxLength={255}
                  placeholder="Deskripsi singkat tentang topik kategori ini"
                  className="textarea textarea-bordered w-full"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Gambar Kategori</legend>
                {previewUrl ? (
                  <div className="aspect-[16/9] rounded-box overflow-hidden border border-base-300 mb-2 bg-base-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] rounded-box border-2 border-dashed border-base-300 mb-2 bg-base-200 flex flex-col items-center justify-center text-base-content/50 gap-1">
                    <ImagePlus className="size-6" />
                    <span className="text-xs">Belum ada gambar</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered file-input-sm w-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (file) {
                      setImageFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </fieldset>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary btn-sm"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setModalOpen(false)}
          />
        </dialog>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Hapus Kategori?</h3>
            <p className="py-4 text-sm">
              Menghapus kategori{" "}
              <strong>&quot;{deleteTarget.category}&quot;</strong> juga akan
              menghapus <strong>{deleteTarget.newsCount} berita</strong> di
              dalamnya. Lanjutkan?
            </p>
            <div className="modal-action">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn btn-ghost btn-sm"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
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
