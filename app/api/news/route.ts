import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { news } from "@/db/schema";
import { getNewsList } from "@/lib/data";
import { getSession } from "@/lib/session";
import { newsSchema } from "@/lib/validators";
import { createExcerpt } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1") || 1;
    const limit = Number(searchParams.get("limit") ?? "12") || 12;
    const categoryId = searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : undefined;
    const query = searchParams.get("q") ?? undefined;
    const sort =
      searchParams.get("sort") === "popular" ? "popular" : "latest";
    const statusParam = searchParams.get("status");

    // Only authenticated admins can view draft/all statuses
    let status: "published" | "draft" | "all" = "published";
    if (statusParam === "all" || statusParam === "draft") {
      const session = await getSession();
      if (session) {
        status = statusParam;
      }
    }

    const result = await getNewsList({
      page,
      limit,
      categoryId,
      query,
      status,
      sort,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/news error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar berita" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const file = formData.get("img");
    let imgBuffer: Buffer | null = null;
    if (file instanceof File && file.size > 0) {
      imgBuffer = Buffer.from(await file.arrayBuffer());
    }

    const excerpt = createExcerpt(
      parsed.data.content,
      parsed.data.excerpt,
      160
    );

    const [inserted] = await db
      .insert(news)
      .values({
        title: parsed.data.title,
        id_category_news: parsed.data.id_category_news,
        excerpt,
        content: parsed.data.content,
        status: parsed.data.status,
        is_featured: parsed.data.is_featured,
        img: imgBuffer,
      })
      .returning({ id_news: news.id_news });

    return NextResponse.json(
      {
        message: `Berhasil menambah berita "${parsed.data.title}"`,
        id_news: inserted.id_news,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/news error:", error);
    return NextResponse.json(
      { error: "Gagal menambah berita" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const ids: number[] = Array.isArray(body?.ids)
      ? body.ids.map(Number).filter((n: number) => Number.isInteger(n) && n > 0)
      : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "Pilih minimal satu berita" },
        { status: 400 }
      );
    }

    await db.delete(news).where(inArray(news.id_news, ids));
    return NextResponse.json({
      message: `Berhasil menghapus ${ids.length} berita`,
    });
  } catch (error) {
    console.error("DELETE /api/news error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus berita" },
      { status: 500 }
    );
  }
}
