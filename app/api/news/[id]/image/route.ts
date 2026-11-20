import { eq } from "drizzle-orm";
import { db } from "@/db";
import { news } from "@/db/schema";
import { createImageResponse } from "@/lib/image-response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const newsId = Number(id);
  if (!Number.isInteger(newsId) || newsId <= 0) {
    return createImageResponse(null);
  }

  const [row] = await db
    .select({ img: news.img })
    .from(news)
    .where(eq(news.id_news, newsId))
    .limit(1);

  return createImageResponse(row?.img);
}
