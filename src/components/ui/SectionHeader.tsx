interface SectionHeaderProps {
  index: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ index, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="section-bar">
      <span className="label-strip">{index}</span>
      <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" className="text-accent shrink-0" aria-hidden="true">
        <circle cx="5" cy="7" r="2" /><circle cx="10" cy="4" r="2" /><circle cx="16" cy="5" r="2" /><circle cx="20" cy="9" r="2" />
        <path d="M12 10c-3 0-3.7 2.1-5.8 3.8C4.2 15.5 5 20 8.5 20c1.5 0 2.2-.8 3.5-.8s2 .8 3.5.8c3.5 0 4.3-4.5 2.3-6.2C15.7 12.1 15 10 12 10Z" />
      </svg>
      <h2 className="font-display font-bold text-xl text-ink m-0">{title}</h2>
      {subtitle && (
        <span className="text-sm text-gray-400 font-body hidden sm:block">{subtitle}</span>
      )}
    </div>
  );
}
