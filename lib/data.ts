import { db } from "@/db";
import { categoryNews, news, users } from "@/db/schema";
import { and, count, desc, eq, ilike, ne, or, sql } from "drizzle-orm";

export interface CategorySummary {
  id_category_news: number;
  category: string;
  description: string | null;
  created_at: Date;
  newsCount: number;
  imageUrl: string;
}

export interface NewsSummary {
  id_news: number;
  id_category_news: number;
  category: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: string;
  views: number;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
  imageUrl: string;
}

export async function getCategories(): Promise<CategorySummary[]> {
  const rows = await db
    .select({
      id_category_news: categoryNews.id_category_news,
      category: categoryNews.category,
      description: categoryNews.description,
      created_at: categoryNews.created_at,
      newsCount: count(news.id_news),
    })
    .from(categoryNews)
    .leftJoin(news, eq(categoryNews.id_category_news, news.id_category_news))
    .groupBy(categoryNews.id_category_news)
    .orderBy(desc(categoryNews.created_at));

  return rows.map((r) => ({
    ...r,
    newsCount: Number(r.newsCount ?? 0),
    imageUrl: `/api/categories/${r.id_category_news}/image`,
  }));
}

export async function getCategoryById(id: number): Promise<CategorySummary | null> {
  const rows = await db
    .select({
      id_category_news: categoryNews.id_category_news,
      category: categoryNews.category,
      description: categoryNews.description,
      created_at: categoryNews.created_at,
      newsCount: count(news.id_news),
    })
    .from(categoryNews)
    .leftJoin(news, eq(categoryNews.id_category_news, news.id_category_news))
    .where(eq(categoryNews.id_category_news, id))
    .groupBy(categoryNews.id_category_news)
    .limit(1);

  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    newsCount: Number(r.newsCount ?? 0),
    imageUrl: `/api/categories/${r.id_category_news}/image`,
  };
}

export interface GetNewsOptions {
  page?: number;
  limit?: number;
  categoryId?: number;
  query?: string;
  status?: "published" | "draft" | "all";
  sort?: "latest" | "popular";
  featuredOnly?: boolean;
}

export async function getNewsList(options: GetNewsOptions = {}) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 12));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (options.categoryId) {
    conditions.push(eq(news.id_category_news, options.categoryId));
  }
  if (options.status && options.status !== "all") {
    conditions.push(eq(news.status, options.status));
  } else if (!options.status) {
    conditions.push(eq(news.status, "published"));
  }
  if (options.featuredOnly) {
    conditions.push(eq(news.is_featured, true));
  }
  if (options.query && options.query.trim().length > 0) {
    const q = `%${options.query.trim()}%`;
    conditions.push(or(ilike(news.title, q), ilike(news.content, q)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(news)
    .where(whereClause);

  const orderBy =
    options.sort === "popular"
      ? [desc(news.views), desc(news.created_at)]
      : [desc(news.created_at)];

  const rows = await db
    .select({
      id_news: news.id_news,
      id_category_news: news.id_category_news,
      category: categoryNews.category,
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      status: news.status,
      views: news.views,
      is_featured: news.is_featured,
      created_at: news.created_at,
      updated_at: news.updated_at,
    })
    .from(news)
    .innerJoin(
      categoryNews,
      eq(news.id_category_news, categoryNews.id_category_news)
    )
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  const totalCount = Number(total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return {
    items: rows.map((r) => ({
      ...r,
      imageUrl: `/api/news/${r.id_news}/image`,
    })) as NewsSummary[],
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
    },
  };
}

export async function getNewsById(
  id: number,
  incrementViews = false
): Promise<NewsSummary | null> {
  if (incrementViews) {
    await db
      .update(news)
      .set({ views: sql`${news.views} + 1` })
      .where(eq(news.id_news, id));
  }

  const rows = await db
    .select({
      id_news: news.id_news,
      id_category_news: news.id_category_news,
      category: categoryNews.category,
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      status: news.status,
      views: news.views,
      is_featured: news.is_featured,
      created_at: news.created_at,
      updated_at: news.updated_at,
    })
    .from(news)
    .innerJoin(
      categoryNews,
      eq(news.id_category_news, categoryNews.id_category_news)
    )
    .where(eq(news.id_news, id))
    .limit(1);

  if (rows.length === 0) return null;
  return {
    ...rows[0],
    imageUrl: `/api/news/${rows[0].id_news}/image`,
  };
}

export async function getRelatedNews(
  categoryId: number,
  excludeNewsId: number,
  limit = 4
): Promise<NewsSummary[]> {
  const rows = await db
    .select({
      id_news: news.id_news,
      id_category_news: news.id_category_news,
      category: categoryNews.category,
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      status: news.status,
      views: news.views,
      is_featured: news.is_featured,
      created_at: news.created_at,
      updated_at: news.updated_at,
    })
    .from(news)
    .innerJoin(
      categoryNews,
      eq(news.id_category_news, categoryNews.id_category_news)
    )
    .where(
      and(
        eq(news.id_category_news, categoryId),
        ne(news.id_news, excludeNewsId),
        eq(news.status, "published")
      )
    )
    .orderBy(desc(news.created_at))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    imageUrl: `/api/news/${r.id_news}/image`,
  }));
}

export async function getDashboardStats() {
  const [{ totalNews }] = await db.select({ totalNews: count() }).from(news);
  const [{ publishedNews }] = await db
    .select({ publishedNews: count() })
    .from(news)
    .where(eq(news.status, "published"));
  const [{ draftNews }] = await db
    .select({ draftNews: count() })
    .from(news)
    .where(eq(news.status, "draft"));
  const [{ totalCategories }] = await db
    .select({ totalCategories: count() })
    .from(categoryNews);
  const [{ totalViews }] = await db
    .select({
      totalViews: sql<number>`COALESCE(SUM(${news.views}), 0)`,
    })
    .from(news);

  const topNews = await getNewsList({
    limit: 5,
    status: "all",
    sort: "popular",
  });

  const categories = await getCategories();

  return {
    totalNews: Number(totalNews ?? 0),
    publishedNews: Number(publishedNews ?? 0),
    draftNews: Number(draftNews ?? 0),
    totalCategories: Number(totalCategories ?? 0),
    totalViews: Number(totalViews ?? 0),
    topNews: topNews.items,
    categories,
  };
}

export async function hasAnyUsers(): Promise<boolean> {
  const [{ total }] = await db.select({ total: count() }).from(users);
  return Number(total ?? 0) > 0;
}
