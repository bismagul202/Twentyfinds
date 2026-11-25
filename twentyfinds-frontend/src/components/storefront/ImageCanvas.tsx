export function ImageCanvas({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`image-canvas ${className}`}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      style={src ? { backgroundImage: `url("${src}")` } : undefined}
    />
  );
}
