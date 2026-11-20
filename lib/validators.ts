import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi").max(51),
  password: z.string().min(1, "Password wajib diisi").max(101),
});

export const setupAdminSchema = z.object({
  username: z.string().trim().min(3, "Username minimal 3 karakter").max(51),
  fullname: z.string().trim().min(2, "Nama lengkap wajib diisi").max(101),
  email: z.string().trim().email("Email tidak valid").max(101),
  password: z.string().min(6, "Password minimal 6 karakter").max(101),
});

export const categorySchema = z.object({
  category: z.string().trim().min(1, "Nama kategori wajib diisi").max(100),
  description: z.string().trim().max(255).optional().nullable(),
});

export const newsSchema = z.object({
  title: z.string().trim().min(1, "Judul berita wajib diisi").max(200),
  id_category_news: z.coerce
    .number()
    .int()
    .positive("Kategori wajib dipilih"),
  excerpt: z.string().trim().max(350).optional().nullable(),
  content: z.string().trim().min(1, "Konten berita wajib diisi"),
  status: z.enum(["published", "draft"]).default("published"),
  is_featured: z.boolean().default(false),
});
