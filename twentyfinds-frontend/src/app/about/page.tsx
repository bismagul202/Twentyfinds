import { StorefrontText } from "@/features/storefront/StorefrontCopy";
import { managedMetadata } from "@/features/storefront/cms";
import type { Metadata } from "next";
import { ContentPage, ManagedContent } from "@/components/storefront/ContentPage";

export function generateMetadata(): Promise<Metadata> {
  return managedMetadata("about", {
    title: "Our story",
    description: "Meet TWENTYFINDS: a little more everyday joy, always under £20.",
  });
}

export default function AboutPage() {
  return (
    <ManagedContent slug="about">
      <ContentPage
        eyebrow={<StorefrontText id="about.a-little-about-us" fallback="A little about us" />}
        title={<StorefrontText id="about.good-things-should-feel-good" fallback="Good things should feel good." />}
        intro={<StorefrontText id="about.twentyfinds-is-a-new-kind-of-happy" fallback="TWENTYFINDS is a new kind of happy place for everyday shopping: a colourful mix of fashion, home, beauty, tech and all the little things in between." />}
        sections={[
          {
            title: <StorefrontText id="about.a-whole-lot-of-everything" fallback="A whole lot of everything" />,
            body: <StorefrontText id="about.we-re-building-a-multi-category-store" fallback="We're building a multi-category store for the things you use, need, gift and simply love. From kitchen bits to fresh accessories, the idea is to make the good stuff easy to find." />,
          },
          {
            title: <StorefrontText id="about.the-under-20-promise" fallback="The under-£20 promise" />,
            body: <StorefrontText id="about.every-product-in-our-store-is-planned" fallback="Every product in our store is planned to be priced from £0.01 to £19.99. We want browsing to feel fun, with clear prices and no guesswork about the kind of shop we're building." />,
          },
          {
            title: <StorefrontText id="about.still-getting-ready" fallback="Still getting ready" />,
            body: <StorefrontText id="about.twentyfinds-is-currently-a-storefront-preview-product" fallback="TWENTYFINDS is currently a storefront preview. Product collections, delivery details and customer support will be confirmed before the shop opens for orders." />,
          },
        ]}
        note={<StorefrontText id="about.this-is-a-demo-storefront-no-orders" fallback="This is a demo storefront. No orders can be placed yet." />}
      />
    </ManagedContent>
  );
}
