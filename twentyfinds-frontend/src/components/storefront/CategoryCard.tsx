import Link from "next/link";
import type { StoreCategory } from "@/features/storefront/data";
import { Icon } from "./Icon";
import { ImageCanvas } from "./ImageCanvas";

export function CategoryCard({ category }: { category: StoreCategory }) {
  return (
    <Link
      className={`category-card category-${category.tint}`}
      href={`/categories/${category.slug}`}
    >
      <ImageCanvas
        src={category.image}
        alt=""
        className="category-photo"
      />
      <span className="category-number">{category.mark}</span>
      <span className="category-card-copy">
        <span>{category.name}</span>
        <small>{category.description}</small>
      </span>
      <span className="category-arrow" aria-hidden="true">
        <Icon name="arrow-right" size={17} />
      </span>
    </Link>
  );
}
