type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-12 md:mb-16 ${align === "center" ? "text-center mx-auto max-w-3xl" : "max-w-2xl"}`}
    >
      {eyebrow && (
        <p
          className={`mb-3 text-sm font-semibold uppercase tracking-widest ${dark ? "text-arizona-gold" : "text-arizona-copper"}`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl ${dark ? "text-white" : "text-navy-900"}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-lg leading-relaxed ${dark ? "text-mist-300" : "text-navy-600"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
