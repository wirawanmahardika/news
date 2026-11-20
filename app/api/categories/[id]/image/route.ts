import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categoryNews } from "@/db/schema";
import { createImageResponse } from "@/lib/image-response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return createImageResponse(null);
  }

  const [row] = await db
    .select({ img: categoryNews.img })
    .from(categoryNews)
    .where(eq(categoryNews.id_category_news, categoryId))
    .limit(1);

  return createImageResponse(row?.img);
}
