import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About Rishab Gautam — Creator of Layla",
  description:
    "Layla is built and maintained by Rishab Gautam (rishabnotfound) — software developer and Co-Founder & DevOps Engineer at Nept Cloud, Delhi, India.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Rishab Gautam — Creator of Layla",
    description:
      "Layla is built and maintained by Rishab Gautam (rishabnotfound) — software developer and Co-Founder & DevOps Engineer at Nept Cloud.",
    url: "https://layla.wtf/about",
    type: "profile",
  },
};

const SITE_URL = "https://layla.wtf";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/about#rishab`,
  name: "Rishab Gautam",
  givenName: "Rishab",
  familyName: "Gautam",
  alternateName: ["rishabnotfound", "Rishab", "Rishab Delhi"],
  url: "https://www.rishab.cv/",
  sameAs: [
    "https://www.rishab.cv/",
    "https://nept.cloud/rishab-gautam",
    "https://github.com/rishabnotfound",
  ],
  jobTitle: "Co-Founder & DevOps Engineer",
  birthDate: "2007-01-22",
  worksFor: {
    "@type": "Organization",
    name: "Nept Cloud",
    url: "https://nept.cloud",
  },
  nationality: { "@type": "Country", name: "India" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Delhi",
    addressCountry: "IN",
  },
  description:
    "Software developer and entrepreneur. Creator of Layla, a free privacy-first web push service. Co-Founder & DevOps Engineer at Nept Cloud. Upstream contributor to Node.js, PreMiD, and FMHY.",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
  ],
};

const projects = [
  { name: "Layla", detail: "Free web-push platform. ~160k subscribers across 50–60 sites, 256k+ notifications delivered." },
  { name: "Syella", detail: "Cross-platform Windows & macOS terminal." },
  { name: "MakimaKey", detail: "Fully-offline end-to-end-encrypted Android TOTP authenticator." },
  { name: "DeltaSys", detail: "Browser-based VPS control plane with SSH + xterm.js." },
  { name: "Commitify", detail: "Production-grade GitHub contribution-graph automation." },
  { name: "MongoSync", detail: "Modern MongoDB admin surface." },
  { name: "RezePlayer", detail: "Standalone HLS/MP4 engine with watch-party sync & Chromecast." },
  { name: "Maki-HLS-Proxy", detail: "The world's first HLS proxy written in pure Lua + nginx." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Layla" width={26} height={26} />
            <span className="text-sm font-semibold">Layla</span>
          </Link>
          <Link
            href="/"
            className="text-[12px] text-white/60 hover:text-white"
          >
            ← Home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-[12px] uppercase tracking-widest text-white/40">
          About the creator
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Rishab Gautam
        </h1>
        <p className="mt-1 text-white/60">
          Software developer · Co-Founder &amp; DevOps Engineer at{" "}
          <a
            href="https://nept.cloud"
            className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
            rel="noopener"
          >
            Nept Cloud
          </a>
          . Delhi, India ·{" "}
          <time dateTime="2007-01-22" className="text-white/50">
            b. 22 Jan 2007
          </time>
          .
        </p>

        <section className="mt-8 space-y-4 text-[15px] leading-relaxed text-white/80">
          <p>
            Layla is built and maintained by Rishab Gautam (also known as{" "}
            <em>rishabnotfound</em>) — a software developer and entrepreneur
            based in Delhi, India. Layla exists because every other web-push
            service wanted an email, a login flow, a pricing tier, and a
            tracker on your site. Layla asks for none of that.
          </p>
          <p>
            Rishab ships production-grade developer infrastructure used by
            hundreds of thousands of people, contributes upstream to{" "}
            <span className="text-white">Node.js</span>,{" "}
            <span className="text-white">PreMiD</span>, and{" "}
            <span className="text-white">FMHY</span>, and co-founded{" "}
            <a
              href="https://nept.cloud/rishab-gautam"
              className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
              rel="noopener"
            >
              Nept Cloud
            </a>
            .
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
            Links
          </h2>
          <ul className="mt-3 space-y-2 text-[14px]">
            <li>
              Personal site ·{" "}
              <a
                href="https://rishab.cv"
                className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
                rel="noopener"
              >
                rishab.cv
              </a>
            </li>
            <li>
              Nept Cloud profile ·{" "}
              <a
                href="https://nept.cloud/rishab-gautam"
                className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
                rel="noopener"
              >
                nept.cloud/rishab-gautam
              </a>
            </li>
            <li>
              GitHub ·{" "}
              <a
                href="https://github.com/rishabnotfound"
                className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
                rel="noopener"
              >
                github.com/rishabnotfound
              </a>
            </li>
            <li>
              Email ·{" "}
              <a
                href="mailto:contact@rishab.cv"
                className="underline decoration-white/30 underline-offset-4 hover:decoration-white"
              >
                contact@rishab.cv
              </a>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
            Other projects by Rishab
          </h2>
          <ul className="mt-3 divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {projects.map((p) => (
              <li key={p.name} className="py-3">
                <div className="text-[14px] font-medium text-white">
                  {p.name}
                </div>
                <div className="text-[13px] text-white/60">{p.detail}</div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-14 border-t border-white/[0.06] pt-6 text-[12px] text-white/40">
          Built with love by{" "}
          <a
            href="https://github.com/rishabnotfound"
            className="text-white/70 underline decoration-white/20 underline-offset-4 hover:text-white"
            rel="noopener"
          >
            Rishab
          </a>
          .
        </footer>
      </article>
    </main>
  );
}
