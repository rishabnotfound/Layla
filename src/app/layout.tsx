import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-KPE1BEC56P";

const SITE_URL = "https://layla.wtf";
const TITLE = "Layla — Web push notifications, without the bloat.";
const DESCRIPTION =
  "Drop one line of JS on your site and start sending browser push notifications. No email, no trackers, no cookies. A 16-digit code is your entire account.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Layla",
  },
  description: DESCRIPTION,
  applicationName: "Layla",
  keywords: [
    "web push",
    "push notifications",
    "browser notifications",
    "notification API",
    "service worker",
    "VAPID",
    "no email signup",
    "privacy-first",
    "layla",
  ],
  authors: [{ name: "Layla" }],
  creator: "Layla",
  publisher: "Layla",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon/favicon-32.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Layla",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/banner.png",
        width: 2556,
        height: 1012,
        alt: "Layla — Web push notifications, without the bloat.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/banner.png",
        alt: "Layla — Web push notifications, without the bloat.",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Layla",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#site`,
      url: SITE_URL,
      name: "Layla",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#org` },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Layla",
      description: DESCRIPTION,
      url: SITE_URL,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: { "@id": `${SITE_URL}/#org` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-white">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
