export function LogoMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <span className={`${className} rounded-[10px] bg-brand-600 text-white flex items-center justify-center shrink-0`}>
      <svg viewBox="-5 -15 110 110" className="w-[70%] h-[70%]" fill="currentColor" aria-hidden="true">
        <path d="M50,92 C46,78 56,66 48,52 C45,46 46,42 47,39 L53,39 C54,42 52,47 55,53 C63,68 52,79 56,92 Z" />
        {[-70, -35, 0, 35, 70].map((deg) => (
          <path key={deg} d="M50,39 C40,25 40,5 50,-7 C60,5 60,25 50,39 Z" transform={`rotate(${deg} 50 39)`} />
        ))}
      </svg>
    </span>
  );
}

export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <a href="#/" className="flex items-center gap-2.5 group" aria-label="STCK Company — início">
      <LogoMark />
      {!compact && (
        <span className="leading-tight">
          <span className={`block font-display font-semibold text-[15px] tracking-wide ${dark ? 'text-white' : 'text-ink'}`}>STCK COMPANY</span>
          <span className={`block text-[10.5px] ${dark ? 'text-white/60' : 'text-ink-muted'}`}>The World Is Yours</span>
        </span>
      )}
    </a>
  );
}
