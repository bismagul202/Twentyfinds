export type StoreCategory = {
  slug: string;
  name: string;
  description: string;
  image: string;
  tint: string;
  mark: string;
  parentSlug?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type StoreProduct = {
  slug: string;
  name: string;
  categorySlug: string;
  price: number;
  compareAt?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  rating: number;
  reviewCount: number;
  categoryName?: string;
  images?: { src: string; alt: string }[];
  variants?: { id: number; name: string; price: number }[];
  image: string;
  label?: string;
  collections: ("trending" | "bestseller" | "new")[];
  description: string;
};

const unsplash = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const categories: StoreCategory[] = [
  {
    slug: "fashion-clothing",
    name: "Fashion & Clothing",
    description: "Everyday looks, little prices",
    image: unsplash("photo-1483985988355-763728e1935b"),
    tint: "lilac",
    mark: "01",
  },
  {
    slug: "womens-fashion",
    name: "Women's Fashion",
    description: "The finishing touches",
    image: unsplash("photo-1529139574466-a303027c1d8b"),
    tint: "peach",
    mark: "02",
  },
  {
    slug: "mens-fashion",
    name: "Men's Fashion",
    description: "Easy staples, sorted",
    image: unsplash("photo-1515886657613-9f3515b0c78f"),
    tint: "blue",
    mark: "03",
  },
  {
    slug: "kids-baby",
    name: "Kids & Baby",
    description: "Big smiles, tiny prices",
    image: unsplash("photo-1503919005314-30d93d07d823"),
    tint: "lime",
    mark: "04",
  },
  {
    slug: "kitchen-dining",
    name: "Kitchen & Dining",
    description: "Good things for the table",
    image: unsplash("photo-1556911220-e15b29be8c8f"),
    tint: "peach",
    mark: "05",
  },
  {
    slug: "home-living",
    name: "Home & Living",
    description: "Make your space yours",
    image: unsplash("photo-1616486338812-3dadae4b4ace"),
    tint: "lilac",
    mark: "06",
  },
  {
    slug: "stationery-office",
    name: "Stationery & Office",
    description: "A fresh page starts here",
    image: unsplash("photo-1455390582262-044cdead277a"),
    tint: "blue",
    mark: "07",
  },
  {
    slug: "beauty-accessories",
    name: "Beauty Accessories",
    description: "Your routine, refreshed",
    image: unsplash("photo-1522335789203-aabd1fc54bc9"),
    tint: "peach",
    mark: "08",
  },
  {
    slug: "electronics-gadgets",
    name: "Electronics & Gadgets",
    description: "Little tech, big energy",
    image: unsplash("photo-1505740420928-5e560c06d30e"),
    tint: "lilac",
    mark: "09",
  },
  {
    slug: "travel-lifestyle",
    name: "Travel & Lifestyle",
    description: "Ready when you are",
    image: unsplash("photo-1500530855697-b586d89ba3ee"),
    tint: "lime",
    mark: "10",
  },
  {
    slug: "toys-games",
    name: "Toys & Games",
    description: "Play more, spend less",
    image: unsplash("photo-1558060370-d644479cb6f7"),
    tint: "blue",
    mark: "11",
  },
  {
    slug: "pet-supplies",
    name: "Pet Supplies",
    description: "For your favourite sidekick",
    image: unsplash("photo-1548199973-03cce0bbc87b"),
    tint: "peach",
    mark: "12",
  },
  {
    slug: "handmade-crochet",
    name: "Handmade Crochet",
    description: "Handmade crochet accessories and home accents",
    image: "/twentyfinds-category-crochet.webp",
    tint: "peach",
    mark: "13",
  },
  {
    slug: "modest-fashion",
    name: "Modest Fashion",
    description: "Abayas, hijabs and everyday scarves",
    image: "/twentyfinds-category-modest-fashion.webp",
    tint: "peach",
    mark: "14",
  },
];

export const products: StoreProduct[] = [
  {
    slug: "everyday-canvas-tote",
    name: "Everyday canvas tote",
    categorySlug: "womens-fashion",
    price: 14.99,
    compareAt: 18.99,
    rating: 4.8,
    reviewCount: 126,
    image: unsplash("photo-1584917865442-de89df76afd3"),
    label: "Bestseller",
    collections: ["trending", "bestseller"],
    description:
      "Your new grab-and-go favourite: a roomy canvas tote made for market runs, coffee dates and everything in between.",
  },
  {
    slug: "cloud-nine-claw-clips",
    name: "Cloud nine claw clips · 3 pack",
    categorySlug: "beauty-accessories",
    price: 4.5,
    rating: 4.9,
    reviewCount: 84,
    image: unsplash("photo-1522335789203-aabd1fc54bc9"),
    label: "Under £5",
    collections: ["trending", "bestseller", "new"],
    description:
      "A trio of easy-grip clips for quick updos, half-up styles and those just-one-more-minute mornings.",
  },
  {
    slug: "heatproof-glass-cup",
    name: "Sunday slow-down glass cup",
    categorySlug: "kitchen-dining",
    price: 9.5,
    compareAt: 12.99,
    rating: 4.7,
    reviewCount: 52,
    image: unsplash("photo-1514228742587-6b1558fcca3d"),
    label: "Just in",
    collections: ["trending", "new"],
    description:
      "A clear double-wall glass for iced matcha, hot chocolate and any little moment worth slowing down for.",
  },
  {
    slug: "pocket-notebook-duo",
    name: "Pocket notebook duo",
    categorySlug: "stationery-office",
    price: 4.99,
    rating: 4.6,
    reviewCount: 39,
    image: unsplash("photo-1455390582262-044cdead277a"),
    label: "Under £5",
    collections: ["bestseller", "new"],
    description:
      "Two pocket-sized notebooks for big ideas, tiny lists and all the things you don't want to forget.",
  },
  {
    slug: "mini-bluetooth-speaker",
    name: "Pocket-size bluetooth speaker",
    categorySlug: "electronics-gadgets",
    price: 19.99,
    rating: 4.5,
    reviewCount: 73,
    image: unsplash("photo-1608043152269-423dbba4e7e1"),
    label: "Under £20",
    collections: ["trending", "bestseller"],
    description:
      "Take your playlist from desk to picnic with this compact, colourful speaker. A fun everyday tech pick.",
  },
  {
    slug: "pack-light-pouch-set",
    name: "Pack-light travel pouch set",
    categorySlug: "travel-lifestyle",
    price: 8.99,
    compareAt: 11.99,
    rating: 4.8,
    reviewCount: 61,
    image: unsplash("photo-1553062407-98eeb64c6a62"),
    label: "Travel ready",
    collections: ["trending", "new"],
    description:
      "Keep the little essentials together with a handy set of soft pouches for weekends away and everyday bags.",
  },
  {
    slug: "tiny-explorer-stacking-cups",
    name: "Tiny explorer stacking cups",
    categorySlug: "kids-baby",
    price: 7.99,
    rating: 4.7,
    reviewCount: 44,
    image: unsplash("photo-1519689680058-324335c77eba"),
    label: "Little favourite",
    collections: ["bestseller", "new"],
    description:
      "Colourful stack-and-play cups for curious little hands. A cheerful pick for playtime at home or away.",
  },
  {
    slug: "weekend-crew-tee",
    name: "Weekend crew cotton tee",
    categorySlug: "mens-fashion",
    price: 12.99,
    rating: 4.6,
    reviewCount: 68,
    image: unsplash("photo-1521572163474-6864f9cf17ab"),
    label: "Everyday staple",
    collections: ["trending", "new"],
    description:
      "A relaxed-fit cotton tee that works with your favourite denim, joggers and pretty much every weekend plan.",
  },
  {
    slug: "fruit-friends-dog-toy",
    name: "Fruit friends squeaky dog toy",
    categorySlug: "pet-supplies",
    price: 3.99,
    rating: 4.8,
    reviewCount: 91,
    image: unsplash("photo-1541599540903-216a46ca1dc0"),
    label: "Under £5",
    collections: ["bestseller"],
    description:
      "A bright, soft squeaky toy for fetch, playtime and making your four-legged best friend's day.",
  },
  {
    slug: "checkerboard-pocket-puzzle",
    name: "Checkerboard pocket puzzle",
    categorySlug: "toys-games",
    price: 5.99,
    rating: 4.5,
    reviewCount: 31,
    image: unsplash("photo-1599623560574-39d485900c95"),
    label: "Screen-free fun",
    collections: ["trending", "new"],
    description:
      "A colourful little brain teaser for rainy afternoons, travel days and friendly family challenges.",
  },
  {
    slug: "ribbed-mini-table-lamp",
    name: "Ribbed mini table lamp",
    categorySlug: "home-living",
    price: 18.49,
    compareAt: 19.99,
    rating: 4.7,
    reviewCount: 28,
    image: unsplash("photo-1507473885765-e6ed057f782c"),
    label: "Nearly gone",
    collections: ["trending", "bestseller"],
    description:
      "A little glow-up for your bedside or reading nook, with a playful ribbed finish and a soft, cosy light.",
  },
  {
    slug: "soft-touch-crossbody-bag",
    name: "Soft-touch mini crossbody",
    categorySlug: "fashion-clothing",
    price: 16.99,
    rating: 4.8,
    reviewCount: 47,
    image: unsplash("photo-1548036328-c9fa89d128fa"),
    label: "New colour",
    collections: ["trending", "new"],
    description:
      "The just-right mini bag for phone, keys and a lip balm, finished with an adjustable strap for hands-free plans.",
  },
  {
    slug: "weekend-sunglasses",
    name: "Weekend mood sunglasses",
    categorySlug: "womens-fashion",
    price: 6.99,
    compareAt: 9.99,
    rating: 4.4,
    reviewCount: 55,
    image: unsplash("photo-1511499767150-a48a237f0083"),
    label: "Sunny day pick",
    collections: ["bestseller"],
    description:
      "An easy-to-wear pair with a modern shape, ready for brighter commutes, garden hangs and weekend plans.",
  },
];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategoryName(slug: string) {
  return getCategory(slug)?.name ?? "Everyday finds";
}

export function getProductPrice(product: StoreProduct) {
  return product.variants?.length
    ? Math.min(...product.variants.map((variant) => variant.price))
    : product.price;
}
