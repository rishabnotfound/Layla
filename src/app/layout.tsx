import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Layla — Push notifications, simplified.",
  description: "Drop one line of JS on your site. Reach your visitors instantly. No email, no trackers.",
  metadataBase: new URL("https://layla.wtf"),
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Layla — Push notifications, simplified.",
    description: "Private, self-hostable web push. No email required.",
    images: ["/banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Layla",
    description: "Push notifications, simplified.",
    images: ["/banner.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-white">{children}</body>
    </html>
  );
}
