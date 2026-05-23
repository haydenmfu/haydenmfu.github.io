interface SectionHeaderProps {
  index: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ index, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="section-bar">
      <span className="label-strip">{index}</span>
      <h2 className="font-display font-bold text-xl tracking-tight text-ink m-0">{title}</h2>
      {subtitle && (
        <span className="text-sm text-gray-400 font-body hidden sm:block">{subtitle}</span>
      )}
    </div>
  );
}
