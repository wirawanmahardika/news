export interface BookmarkedArticle {
  id_news: number;
  title: string;
  category: string;
  imageUrl: string;
  savedAt: string;
}

const STORAGE_KEY = "abnews-bookmarks";

export function getBookmarks(): BookmarkedArticle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isBookmarked(idNews: number): boolean {
  return getBookmarks().some((b) => b.id_news === idNews);
}

export function toggleBookmark(article: BookmarkedArticle): boolean {
  const current = getBookmarks();
  const exists = current.some((b) => b.id_news === article.id_news);
  const next = exists
    ? current.filter((b) => b.id_news !== article.id_news)
    : [article, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("abnews-bookmarks-changed"));
  return !exists;
}

export function removeBookmark(idNews: number) {
  const next = getBookmarks().filter((b) => b.id_news !== idNews);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("abnews-bookmarks-changed"));
}
