import { NextResponse } from "next/server";
import { db } from "@/db";
import { categoryNews } from "@/db/schema";
import { getCategories } from "@/lib/data";
import { getSession } from "@/lib/session";
import { categorySchema } from "@/lib/validators";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil kategori" },
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
    const parsed = categorySchema.safeParse({
      category: formData.get("category"),
      description: formData.get("description") || null,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid" },
        { status: 400 }
      );
    }

    const file = formData.get("img");
    let imgBuffer: Buffer | null = null;
    if (file instanceof File && file.size > 0) {
      imgBuffer = Buffer.from(await file.arrayBuffer());
    }

    const [inserted] = await db
      .insert(categoryNews)
      .values({
        category: parsed.data.category,
        description: parsed.data.description ?? null,
        img: imgBuffer,
      })
      .returning({ id_category_news: categoryNews.id_category_news });

    return NextResponse.json(
      {
        message: `Berhasil membuat kategori ${parsed.data.category}`,
        id_category_news: inserted.id_category_news,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: "Gagal membuat kategori" },
      { status: 500 }
    );
  }
}
