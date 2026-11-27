"use client";

import Image from "next/image";
import { useStorefrontCopy } from "@/features/storefront/StorefrontCopy";

export function BrandLogo({ copyId, src, size = 80 }: { copyId: string; src: string; size?: number }) {
  const override = useStorefrontCopy()(copyId, "");

  return override ? (
    <span className="brand-wordmark">{override}</span>
  ) : (
    <Image className="brand-logo" src={src} alt="" width={size} height={size} unoptimized={!src.startsWith("/")} />
  );
}
