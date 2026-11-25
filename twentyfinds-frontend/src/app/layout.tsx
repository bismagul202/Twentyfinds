import { formatStorefrontCopy } from "@/features/storefront/copy-text";
import { Suspense } from "react";
import { StorefrontCopyProvider } from "@/features/storefront/StorefrontCopy";
import { getStorefront } from "@/features/storefront/cms";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { StorefrontProvider } from "@/features/storefront/StorefrontProvider";
import "./globals.css";
import "./storefront-design.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getStorefront().catch(() => ({ copy: {} }));
  const text = (id: string, fallback: string) => formatStorefrontCopy(copy, id, fallback);
  return {
    title: {
      default: text("site.seo-title", "TWENTYFINDS | Everything You Love. Under £20."),
      template: text("site.seo-template", "%s | TWENTYFINDS"),
    },
    description: text("site.seo-description", "Discover fashion, home, beauty, gadgets and more. Find the good stuff, all for under £20."),
  };
}

async function StorefrontShell({ children }: { children: React.ReactNode }) {
  const { categories, pages, copy } = await getStorefront().catch(() => ({ categories: [], pages: [], copy: {} }));
  const announcement = pages.find((page) => page.slug === "site-announcement");

  return (
    <StorefrontCopyProvider copy={copy ?? {}}>
      <StorefrontProvider>
        <SiteHeader
          announcement={announcement}
          categories={categories.filter((category) => !category.parentSlug).map(({ name, slug }) => ({ name, slug }))}
        />
        <main className="site-main">{children}</main>
        <SiteFooter pages={pages} categories={categories} copy={copy} />
      </StorefrontProvider>
    </StorefrontCopyProvider>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense>
          <StorefrontShell>{children}</StorefrontShell>
        </Suspense>
      </body>
    </html>
  );
}
