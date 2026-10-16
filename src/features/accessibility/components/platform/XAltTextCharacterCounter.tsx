type XAltTextCharacterCounterProps = {
  altText: string;
  limit: number;
};

export function XAltTextCharacterCounter({
  altText,
  limit,
}: XAltTextCharacterCounterProps) {
  const length = altText.length;
  const over = length > limit;
  return (
    <p
      className={`text-sm ${over ? "text-amber-950" : "text-muted"}`}
      aria-live="polite"
    >
      Alt text length: {length} / {limit}
      {over ? " — exceeds X documented limit; review before publishing." : ""}
    </p>
  );
}
