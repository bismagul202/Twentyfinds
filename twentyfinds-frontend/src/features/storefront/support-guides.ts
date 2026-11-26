export const supportGuides = [
  {
    slug: "our-handmade-story",
    linkId: "handmade-story",
    title: "Our Handmade Story",
    intro: "Family-made pieces sit alongside everyday finds at 20ISH. The Handmade Studio brings together craft and gifting in one place.",
    sections: [
      { id: "studio", title: "Inside the Handmade Studio", body: "Discover the collection themes, from crochet bags and flowers to bracelets, keychains and pipe cleaner crafts." },
      { id: "browse", title: "Find the details on each product", body: "Check the published product page for its description, options and price. The studio collection may change as new pieces are published." },
    ],
    browseLabel: "Browse handmade",
    browseHref: "/shop?q=handmade",
  },
  {
    slug: "personalisation",
    linkId: "personalisation",
    title: "Personalisation",
    intro: "Explore ideas for customised gifts, name-based keepsakes and accessories with a personal touch.",
    sections: [
      { id: "options", title: "Where to find options", body: "Published product pages show any options available for that item. Check the description before choosing a gift." },
      { id: "enquiries", title: "Questions about personalisation", body: "Use the contact form for an enquiry. Online customisation requests and orders are currently unavailable on 20ISH." },
    ],
    browseLabel: "Browse personalised finds",
    browseHref: "/shop?q=personalised",
  },
  {
    slug: "wedding-nikah",
    linkId: "wedding-nikah",
    title: "Wedding & Nikah",
    intro: "Explore ideas for wedding and Nikah stationery, keepsakes and crafts.",
    sections: [
      { id: "collection", title: "What the collection covers", body: "Look for cards, certificates, favours and wedding crafts as products are published. Individual listings describe what each item includes." },
      { id: "enquiries", title: "Planning your celebration", body: "Use the contact form for questions about an item. Bespoke orders, delivery dates and lead times are not confirmed through the preview." },
    ],
    browseLabel: "Browse wedding finds",
    browseHref: "/shop?q=wedding",
  },
] as const;

export function getSupportGuide(slug: string) {
  return supportGuides.find((guide) => guide.slug === slug);
}
