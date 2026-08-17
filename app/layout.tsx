import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "一生的回聲｜精神健康生命體驗 RPG";
const description = "走過一段由病友共同生命經驗啟發、關於症狀、家庭、工作與陪伴的人生旅程。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630, alt: "一生的回聲：深夜客廳與孩子的背影" }] },
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
