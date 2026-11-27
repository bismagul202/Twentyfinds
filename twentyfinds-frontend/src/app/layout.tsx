import { formatStorefrontCopy } from "@/features/storefront/copy-text";
import { storefrontBrand, whatsappHref } from "@/features/storefront/brand";
import { Suspense } from "react";
import { StorefrontCopyProvider } from "@/features/storefront/StorefrontCopy";
import { bannerImage, getStorefront } from "@/features/storefront/cms";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { Icon } from "@/components/storefront/Icon";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { RouteSkeleton } from "@/components/storefront/RouteSkeleton";
import { StorefrontProvider } from "@/features/storefront/StorefrontProvider";
import "./globals.css";
import "./storefront-design.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getStorefront().catch(() => ({ copy: {} }));
  const text = (id: string, fallback: string) => formatStorefrontCopy(copy, id, fallback);
  return {
    title: {
      default: text("site.seo-title", `${storefrontBrand.name} | ${storefrontBrand.primaryTagline.join(" ")}`),
      template: text("site.seo-template", `%s | ${storefrontBrand.name}`),
    },
    description: text("site.seo-description", "Discover fashion, home, beauty, gadgets and more. Find the good stuff, all for under £20."),
  };
}

async function StorefrontShell({ children }: { children: React.ReactNode }) {
  const storefront = await getStorefront().catch(() => null);
  const { categories = [], pages = [], copy = {}, products = [], banners = [], previewCatalog } = storefront ?? {};
  const announcement = pages.find((page) => page.slug === "site-announcement");
  const logo = bannerImage(banners, "site-logo", "/logo-transparent.webp");

  return (
    <StorefrontCopyProvider copy={copy ?? {}}>
      <StorefrontProvider>
        <SiteHeader
          announcement={announcement}
          logo={logo}
          categories={categories.map(({ name, slug }) => ({ name, slug }))}
          shoppingProducts={previewCatalog ? [] : products.map(({ slug, name, image, price, variants }) => ({
            slug, name, image, price, variants,
          }))}
        />
        <main id="main-content" className="site-main" tabIndex={-1}>{children}</main>
        <SiteFooter pages={pages} categories={categories} copy={copy} logo={logo} />
        <a className="whatsapp-float" href={whatsappHref(copy)}
          aria-label={formatStorefrontCopy(copy, "contact.whatsapp-floating", "Chat with 20ISH on WhatsApp")}
          target="_blank" rel="noopener noreferrer">
          <Icon name="whatsapp" size={30} />
        </a>
      </StorefrontProvider>
    </StorefrontCopyProvider>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={storefrontBrand.locale}
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<main id="main-content" className="site-main" tabIndex={-1}><RouteSkeleton /></main>}>
          <StorefrontShell>{children}</StorefrontShell>
        </Suspense>
      </body>
    </html>
  );
}
