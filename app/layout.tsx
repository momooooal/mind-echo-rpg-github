import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "一生的回聲｜人生養成敘事 RPG";
const description = "你只是活著，後來才慢慢知道，原來有些事情別人不用這麼用力。從出生、離家與工作一路活到老年的完整人生養成 RPG。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og-v3.png`;

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1536, height: 1024, alt: "一生的回聲：從童年房間、工作與病友群組走到老年的手繪人生 RPG" }] },
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
