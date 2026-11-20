"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  Heading2,
  ImagePlus,
  PenLine,
  Quote,
  Save,
  Sparkles,
} from "lucide-react";
import type { CategorySummary, NewsSummary } from "@/lib/data";
import { renderArticleContent } from "@/lib/utils";
import { useToast } from "./ToastProvider";

interface NewsEditorFormProps {
  categories: CategorySummary[];
  initialData?: NewsSummary;
}

export function NewsEditorForm({
  categories,
  initialData,
}: NewsEditorFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [categoryId, setCategoryId] = useState(
    initialData?.id_category_news
      ? String(initialData.id_category_news)
      : categories[0]
        ? String(categories[0].id_category_news)
        : ""
  );
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [status, setStatus] = useState<"published" | "draft">(
    initialData?.status === "draft" ? "draft" : "published"
  );
  const [isFeatured, setIsFeatured] = useState(
    initialData?.is_featured ?? false
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    initialData?.imageUrl ?? ""
  );
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const insertSnippet = (snippet: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      showToast("Buat kategori terlebih dahulu", "error");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("id_category_news", categoryId);
      formData.append("excerpt", excerpt);
      formData.append("content", content);
      formData.append("status", status);
      formData.append("is_featured", String(isFeatured));
      if (imageFile) {
        formData.append("img", imageFile);
      }

      const url = isEdit
        ? `/api/news/${initialData!.id_news}`
        : "/api/news";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Gagal menyimpan berita", "error");
        return;
      }

      showToast(
        isEdit ? "Berita berhasil diperbarui!" : "Berita berhasil ditambahkan!",
        "success"
      );
      router.push("/admin/news");
      router.refresh();
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/news" className="btn btn-ghost btn-sm btn-square">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              {isEdit ? "Edit Berita" : "Tulis Berita Baru"}
            </h1>
            <p className="text-xs text-base-content/60">
              Gunakan format teks biasa, Markdown sederhana (##, &gt;), atau HTML
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary gap-2"
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Save className="size-4" />
            )}
            {isEdit ? "Simpan Perubahan" : "Publikasikan / Simpan"}
          </button>
        </div>
      </div>

      {categories.length === 0 && (
        <div className="alert alert-warning">
          <span>
            Belum ada kategori.{" "}
            <Link href="/admin/categories" className="link font-bold">
              Buat kategori terlebih dahulu
            </Link>{" "}
            sebelum menulis berita.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Main Editor */}
        <div className="lg:col-span-8 space-y-5">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 space-y-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Judul Berita</legend>
                <input
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Masukkan judul berita yang menarik..."
                  className="input input-bordered input-lg w-full font-bold"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  Ringkasan / Excerpt (Opsional)
                </legend>
                <textarea
                  rows={2}
                  maxLength={350}
                  placeholder="Ringkasan singkat untuk tampilan kartu (otomatis dibuat jika dikosongkan)"
                  className="textarea textarea-bordered w-full"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </fieldset>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div role="tablist" className="tabs tabs-box tabs-sm">
                    <button
                      type="button"
                      role="tab"
                      onClick={() => setTab("write")}
                      className={`tab gap-1.5 ${
                        tab === "write" ? "tab-active" : ""
                      }`}
                    >
                      <PenLine className="size-3.5" />
                      Tulis
                    </button>
                    <button
                      type="button"
                      role="tab"
                      onClick={() => setTab("preview")}
                      className={`tab gap-1.5 ${
                        tab === "preview" ? "tab-active" : ""
                      }`}
                    >
                      <Eye className="size-3.5" />
                      Pratinjau
                    </button>
                  </div>

                  {tab === "write" && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertSnippet("## Subjudul Baru")}
                        className="btn btn-ghost btn-xs gap-1"
                        title="Sisipkan Subjudul"
                      >
                        <Heading2 className="size-3.5" />
                        Heading
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet("> Kutipan penting di sini")
                        }
                        className="btn btn-ghost btn-xs gap-1"
                        title="Sisipkan Kutipan"
                      >
                        <Quote className="size-3.5" />
                        Kutipan
                      </button>
                    </div>
                  )}
                </div>

                {tab === "write" ? (
                  <textarea
                    required
                    rows={14}
                    placeholder="Tulis isi berita lengkap di sini..."
                    className="textarea textarea-bordered w-full font-sans leading-relaxed"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                ) : (
                  <div className="min-h-[340px] p-5 rounded-box border border-base-300 bg-base-200/40">
                    {content.trim() ? (
                      <div
                        className="article-content"
                        dangerouslySetInnerHTML={{
                          __html: renderArticleContent(content),
                        }}
                      />
                    ) : (
                      <p className="text-base-content/50 italic">
                        Belum ada konten untuk dipratinjau...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Settings */}
        <div className="lg:col-span-4 space-y-5">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 space-y-4">
              <h2 className="font-bold text-base">Pengaturan Publikasi</h2>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Kategori</legend>
                <select
                  required
                  className="select select-bordered w-full"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="" disabled>
                    Pilih kategori...
                  </option>
                  {categories.map((c) => (
                    <option key={c.id_category_news} value={c.id_category_news}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">Status</legend>
                <select
                  className="select select-bordered w-full"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value === "draft" ? "draft" : "published"
                    )
                  }
                >
                  <option value="published">Published (Tayang)</option>
                  <option value="draft">Draft (Konsep)</option>
                </select>
              </fieldset>

              <label className="label cursor-pointer justify-between bg-base-200/60 p-3 rounded-box border border-base-300">
                <span className="label-text font-medium flex items-center gap-2">
                  <Sparkles className="size-4 text-warning" />
                  Jadikan Sorotan Utama
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
              </label>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 space-y-3">
              <h2 className="font-bold text-base">Gambar Sampul</h2>

              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-base-300 hover:border-primary rounded-box overflow-hidden aspect-[16/10] bg-base-200 flex items-center justify-center transition-colors">
                  {previewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-base-content/60 space-y-2">
                      <ImagePlus className="size-8 mx-auto" />
                      <p className="text-xs font-medium">
                        Klik untuk unggah gambar sampul (JPG/PNG)
                      </p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered file-input-sm w-full mt-3"
                  onChange={(e) =>
                    handleImageChange(e.target.files?.[0] ?? null)
                  }
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
