import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "一生的回聲｜人生養成敘事 RPG";
const description = "你只是活著，後來才慢慢知道，原來有些事情別人不用這麼用力。從出生走到第一次求助的 0–18 歲可玩篇章。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og-v2.png`;

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1729, height: 910, alt: "一生的回聲：手繪 RPG 房間、便條與白色袋子" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
