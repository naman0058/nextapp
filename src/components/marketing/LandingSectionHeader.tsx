type LandingSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
};

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  id,
}: LandingSectionHeaderProps) {
  return (
    <header
      className={
        align === "center" ? "mx-auto mb-12 max-w-3xl text-center" : "mb-10 max-w-2xl"
      }
    >
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="font-display mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          {description}
        </p>
      )}
    </header>
  );
}
