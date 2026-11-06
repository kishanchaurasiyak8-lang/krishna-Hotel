interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({ eyebrow, title, description, align = 'center' }: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-2xl ${alignment}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-700">{eyebrow}</p>
      <h2 className="mt-3 text-4xl sm:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-navy-600">{description}</p>}
    </div>
  );
}
