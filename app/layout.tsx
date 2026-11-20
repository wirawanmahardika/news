import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "ABNews — Portal Berita & Studio Redaksi",
  description:
    "Portal berita modern dengan dukungan mode terang & gelap serta studio redaksi terintegrasi.",
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('abnews-theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-theme="light"
      suppressHydrationWarning
      className="h-full antialiased font-sans"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-base-100 text-base-content">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
