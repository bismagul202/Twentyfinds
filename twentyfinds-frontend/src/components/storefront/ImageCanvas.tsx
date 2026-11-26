import Image from "next/image";

export function ImageCanvas({
  src,
  alt,
  className = "",
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const useImage = Boolean(src && sizes);
  return (
    <div
      className={`image-canvas ${className}${useImage ? " image-canvas-responsive" : ""}`}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      style={src && !useImage ? { backgroundImage: `url("${src}")` } : undefined}
    >
      {useImage && <Image src={src} alt="" fill sizes={sizes} unoptimized={!src.startsWith("/") || src.startsWith("//")} />}
    </div>
  );
}
