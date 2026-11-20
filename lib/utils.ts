export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createExcerpt(
  content: string,
  customExcerpt?: string | null,
  maxLength = 150
): string {
  const source =
    customExcerpt && customExcerpt.trim().length > 0
      ? customExcerpt.trim()
      : stripHtml(content);
  if (source.length <= maxLength) return source;
  return source.slice(0, maxLength).trimEnd() + "...";
}

export function estimateReadingTime(content: string): number {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDateID(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateLongID(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function renderArticleContent(raw: string): string {
  const trimmed = raw.trim();
  // If content already contains HTML tags, render as-is
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }
  // Convert plain text / simple markdown paragraphs to clean HTML
  return trimmed
    .split(/\n{2,}/)
    .map((block) => {
      const b = block.trim();
      if (b.startsWith("## ")) {
        return `<h2>${escapeHtml(b.slice(3))}</h2>`;
      }
      if (b.startsWith("### ")) {
        return `<h3>${escapeHtml(b.slice(4))}</h3>`;
      }
      if (b.startsWith("> ")) {
        return `<blockquote>${escapeHtml(b.slice(2))}</blockquote>`;
      }
      return `<p>${escapeHtml(b).replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
