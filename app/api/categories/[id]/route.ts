import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categoryNews } from "@/db/schema";
import { getSession } from "@/lib/session";
import { categorySchema } from "@/lib/validators";

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
    const categoryId = Number(id);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json({ error: "ID kategori tidak valid" }, { status: 400 });
    }

    const formData = await request.formData();
    const parsed = categorySchema.safeParse({
      category: formData.get("category"),
      description: formData.get("description") || null,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const updateData: Partial<typeof categoryNews.$inferInsert> = {
      category: parsed.data.category,
      description: parsed.data.description ?? null,
    };

    const file = formData.get("img");
    if (file instanceof File && file.size > 0) {
      updateData.img = Buffer.from(await file.arrayBuffer());
    }

    await db
      .update(categoryNews)
      .set(updateData)
      .where(eq(categoryNews.id_category_news, categoryId));

    return NextResponse.json({ message: "Berhasil mengubah kategori" });
  } catch (error) {
    console.error("PATCH /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal mengubah kategori" },
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
    const categoryId = Number(id);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json({ error: "ID kategori tidak valid" }, { status: 400 });
    }

    await db
      .delete(categoryNews)
      .where(eq(categoryNews.id_category_news, categoryId));

    return NextResponse.json({ message: "Berhasil menghapus kategori" });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
