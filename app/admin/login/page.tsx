"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Newspaper, ShieldCheck, UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/components/ToastProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [needsSetup, setNeedsSetup] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace("/admin");
          return;
        }
        setNeedsSetup(Boolean(data.needsSetup));
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = needsSetup ? "/api/auth/setup" : "/api/auth/login";
      const payload = needsSetup
        ? { username, password, fullname, email }
        : { username, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal autentikasi");
        return;
      }

      showToast(
        needsSetup
          ? "Akun admin pertama berhasil dibuat!"
          : "Selamat datang kembali!",
        "success"
      );
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col justify-between p-4">
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto pt-2">
        <Link href="/" className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft className="size-4" />
          Kembali ke Portal
        </Link>
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full mx-auto my-8">
        <div className="card bg-base-100 border border-base-300 shadow-2xl">
          <div className="card-body p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-primary text-primary-content shadow-md">
                {needsSetup ? (
                  <UserPlus className="size-7" />
                ) : (
                  <Newspaper className="size-7" />
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight">
                {needsSetup ? "Setup Admin Pertama" : "ABNews Studio"}
              </h1>
              <p className="text-sm text-base-content/65">
                {needsSetup
                  ? "Database belum memiliki akun admin. Buat akun pertama untuk mulai mengelola berita."
                  : "Masuk ke dashboard redaksi untuk mengelola berita & kategori."}
              </p>
            </div>

            {checking ? (
              <div className="space-y-3 py-4">
                <div className="skeleton h-10 w-full" />
                <div className="skeleton h-10 w-full" />
                <div className="skeleton h-10 w-full" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="alert alert-error text-sm py-2.5">
                    <span>{error}</span>
                  </div>
                )}

                {needsSetup && (
                  <>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">Nama Lengkap</legend>
                      <input
                        type="text"
                        required
                        className="input input-bordered w-full"
                        placeholder="Contoh: Wirawan Mahardika"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                      />
                    </fieldset>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">Email</legend>
                      <input
                        type="email"
                        required
                        className="input input-bordered w-full"
                        placeholder="admin@abnews.id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </fieldset>
                  </>
                )}

                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Username</legend>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    className="input input-bordered w-full"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Password</legend>
                  <input
                    type="password"
                    required
                    autoComplete={
                      needsSetup ? "new-password" : "current-password"
                    }
                    className="input input-bordered w-full"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </fieldset>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full gap-2 mt-2"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : needsSetup ? (
                    <ShieldCheck className="size-4" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                  {needsSetup ? "Buat Akun & Masuk" : "Masuk ke Studio"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-base-content/50 pb-2">
        ABNews Editorial Studio &bull; Drizzle ORM + Next.js + DaisyUI
      </p>
    </div>
  );
}
