import type { StoreCategory } from "./data";
import { departmentGroups } from "./navigation";

const departmentImages: Record<string, string> = {
  "home-living": "/20ish-category-home-living.webp",
  kitchen: "/20ish-category-kitchen.webp",
  fashion: "/20ish-category-fashion.webp",
  "modest-fashion": "/twentyfinds-category-modest-fashion.webp",
  stationery: "/20ish-category-stationery.webp",
  beauty: "/20ish-category-beauty.webp",
  handmade: "/twentyfinds-category-crochet.webp",
  personalise: "/20ish-personalisation-studio.webp",
  "gifts-occasions": "/20ish-category-gifts.webp",
  "wedding-nikah": "/20ish-category-wedding-nikah.webp",
};

const storefrontDepartments = departmentGroups.flatMap(({ items }) => items)
  .filter(({ id }) => Object.hasOwn(departmentImages, id));

export function getHomeDepartments(categories: StoreCategory[]) {
  const published = categories.filter(({ parentSlug }) => !parentSlug).slice(0, 12);
  if (!published.length) {
    return storefrontDepartments.map(({ id, label, href }) => ({
      id,
      name: label,
      href,
      image: departmentImages[id],
    }));
  }

  return published.map(({ slug, name, image }) => {
    const department = storefrontDepartments.find(({ slugs }) => slugs?.includes(slug));
    return {
      id: slug,
      name,
      href: `/categories/${slug}`,
      image: image || (department && departmentImages[department.id]) || "/20ish-hero-banner.webp",
    };
  });
}
