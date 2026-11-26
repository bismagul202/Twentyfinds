type NavigationItem = {
  id: string;
  label: string;
  slugs?: string[];
  href: string;
};

export const newIn = { id: "new-arrivals", label: "New In", href: "/shop?sort=new" };
export const shopAll = { id: "products", label: "Shop All", href: "/shop" };

export const departmentGroups: { id: string; label: string; items: NavigationItem[] }[] = [
  {
    id: "home-lifestyle",
    label: "Home & Lifestyle",
    items: [
      { id: "home-living", label: "Home & Living", slugs: ["home-living"], href: "/shop?q=home" },
      { id: "kitchen", label: "Kitchen", slugs: ["kitchen-dining", "kitchen"], href: "/shop?q=kitchen" },
      { id: "stationery", label: "Stationery", slugs: ["stationery-office", "stationery"], href: "/shop?q=stationery" },
      { id: "travel-lifestyle", label: "Travel & Lifestyle", slugs: ["travel-lifestyle"], href: "/shop?q=travel" },
    ],
  },
  {
    id: "style-beauty",
    label: "Style & Beauty",
    items: [
      { id: "fashion", label: "Fashion", slugs: ["fashion-clothing", "fashion"], href: "/shop?q=fashion" },
      { id: "modest-fashion", label: "Modest Fashion", slugs: ["modest-fashion"], href: "/shop?q=modest" },
      { id: "beauty", label: "Beauty", slugs: ["beauty-accessories", "beauty"], href: "/shop?q=beauty" },
    ],
  },
  {
    id: "gifting",
    label: "Gifting",
    items: [
      { id: "handmade", label: "Handmade", slugs: ["handmade-crochet", "handmade"], href: "/shop?q=handmade" },
      { id: "personalise", label: "Personalise", slugs: ["personalise", "personalised-gifts"], href: "/shop?q=personalised" },
      { id: "gifts-occasions", label: "Gifts & Occasions", slugs: ["gifts-occasions", "gifts-and-occasions", "gifts"], href: "/shop?q=gift" },
      { id: "wedding-nikah", label: "Wedding & Nikah", slugs: ["wedding-nikah", "wedding-and-nikah"], href: "/shop?q=wedding" },
    ],
  },
];

export const moreLinks = [
  { id: "best-sellers", label: "Best Sellers", href: "/shop?sort=bestsellers" },
  { id: "offers", label: "Offers", href: "/shop?deals=1" },
];

export const informationLinks = [
  { id: "about", label: "About", href: "/about" },
  { id: "contact", label: "Contact", href: "/contact" },
];
