export const supportGuides = [
  {
    slug: "our-handmade-story",
    linkId: "handmade-story",
    title: "Our Handmade Story",
    intro: "A crochet flower, a textured bag or a little charm can make an everyday gift feel personal. Our team brings these details together in the Handmade Studio.",
    image: "/twentyfinds-category-crochet.webp",
    sections: [
      { id: "studio", title: "Inside the Handmade Studio", body: "Discover the collection themes, from crochet bags and flowers to bracelets, keychains and pipe cleaner crafts." },
      { id: "browse", title: "Find the details on each product", body: "Check the published product page for its description, options and price. The studio collection may change as new pieces are published." },
    ],
    browseLabel: "Browse handmade",
    browseHref: "/shop?q=handmade",
    categorySlugs: ["handmade-crochet", "handmade"],
    searchTerms: ["handmade", "crochet"],
    browseOptions: [
      { label: "Crochet bags", query: "crochet bag" },
      { label: "Crochet flowers", query: "crochet flower" },
      { label: "Bracelets", query: "bracelet" },
      { label: "Keychains", query: "keychain" },
      { label: "Pipe cleaner crafts", query: "pipe cleaner" },
    ],
  },
  {
    slug: "personalisation",
    linkId: "personalisation",
    title: "Personalisation",
    intro: "Explore ideas for customised gifts, name-based keepsakes and accessories with a personal touch.",
    image: "/20ish-personalisation-studio.webp",
    sections: [
      { id: "options", title: "Where to find options", body: "Published product pages show any options available for that item. Check the description before choosing a gift." },
      { id: "enquiries", title: "Questions about personalisation", body: "Use the contact form for an enquiry. Online customisation requests and orders are currently unavailable on 20ISH." },
    ],
    browseLabel: "Browse personalised finds",
    browseHref: "/shop?q=personalised",
    categorySlugs: ["personalise", "personalised-gifts"],
    searchTerms: ["personalised", "customised"],
    browseOptions: [
      { label: "Name keepsakes", query: "name" },
      { label: "Personalised accessories", query: "accessories", fallbackQuery: "personalised accessories" },
      { label: "Personalised gifts", query: "personalised" },
    ],
  },
  {
    slug: "wedding-nikah",
    linkId: "wedding-nikah",
    title: "Wedding & Nikah",
    intro: "From the invitation that sets the tone to a favour guests can take home, explore ideas for the small details of a wedding or Nikah.",
    image: "/20ish-wedding-nikah.webp",
    sections: [
      { id: "collection", title: "What the collection covers", body: "Look for cards, certificates, favours and wedding crafts as products are published. Individual listings describe what each item includes." },
      { id: "enquiries", title: "Planning your celebration", body: "Use the contact form for questions about an item. Bespoke orders, delivery dates and lead times are not confirmed through the preview." },
    ],
    browseLabel: "Browse wedding finds",
    browseHref: "/shop?q=wedding",
    categorySlugs: ["wedding-nikah", "wedding-and-nikah"],
    searchTerms: ["wedding", "nikah"],
    browseOptions: [
      { label: "Wedding cards", query: "card", fallbackQuery: "wedding card" },
      { label: "Nikah certificates", query: "certificate", fallbackQuery: "nikah certificate" },
      { label: "Wedding favours", query: "favour", fallbackQuery: "wedding favour" },
      { label: "Wedding crafts", query: "craft", fallbackQuery: "wedding craft" },
    ],
  },
] as const;

export function getSupportGuide(slug: string) {
  return supportGuides.find((guide) => guide.slug === slug);
}
