import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { news } from "@/db/schema";
import { getNewsById } from "@/lib/data";
import { getSession } from "@/lib/session";
import { newsSchema } from "@/lib/validators";
import { createExcerpt } from "@/lib/utils";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const newsId = Number(id);
  if (!Number.isInteger(newsId) || newsId <= 0) {
    return NextResponse.json({ error: "ID berita tidak valid" }, { status: 400 });
  }

  const item = await getNewsById(newsId, false);
  if (!item) {
    return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ news: item });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const newsId = Number(id);
    if (!Number.isInteger(newsId) || newsId <= 0) {
      return NextResponse.json({ error: "ID berita tidak valid" }, { status: 400 });
    }

    const formData = await request.formData();
    const parsed = newsSchema.safeParse({
      title: formData.get("title"),
      id_category_news: formData.get("id_category_news"),
      excerpt: formData.get("excerpt") || null,
      content: formData.get("content"),
      status: formData.get("status") || "published",
      is_featured: formData.get("is_featured") === "true",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data berita tidak valid" },
        { status: 400 }
      );
    }

    const updateData: Partial<typeof news.$inferInsert> = {
      title: parsed.data.title,
      id_category_news: parsed.data.id_category_news,
      excerpt: createExcerpt(parsed.data.content, parsed.data.excerpt, 160),
      content: parsed.data.content,
      status: parsed.data.status,
      is_featured: parsed.data.is_featured,
    };

    const file = formData.get("img");
    if (file instanceof File && file.size > 0) {
      updateData.img = Buffer.from(await file.arrayBuffer());
    }

    await db.update(news).set(updateData).where(eq(news.id_news, newsId));

    return NextResponse.json({ message: "Berhasil memperbarui berita" });
  } catch (error) {
    console.error("PATCH /api/news/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui berita" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const newsId = Number(id);
    if (!Number.isInteger(newsId) || newsId <= 0) {
      return NextResponse.json({ error: "ID berita tidak valid" }, { status: 400 });
    }

    await db.delete(news).where(eq(news.id_news, newsId));
    return NextResponse.json({ message: "Berhasil menghapus berita" });
  } catch (error) {
    console.error("DELETE /api/news/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus berita" },
      { status: 500 }
    );
  }
}
