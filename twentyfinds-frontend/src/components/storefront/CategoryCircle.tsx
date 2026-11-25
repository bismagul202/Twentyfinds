import Link from "next/link";
import type { StoreCategory } from "@/features/storefront/data";
import { ImageCanvas } from "./ImageCanvas";

export function CategoryCircle({
  category,
}: {
  category: StoreCategory;
}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="category-circle-card"
    >
      <ImageCanvas
        src={category.image}
        alt={category.name}
        className="category-circle-image"
      />
      <span>{category.name}</span>
    </Link>
  );
}
