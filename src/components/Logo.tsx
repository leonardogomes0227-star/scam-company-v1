/** Desenho do coqueiro (64x64), usado na logo e no favicon. */
export function PalmIcon({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
      <g transform="translate(-3.5 0.5)" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
        {/* tronco */}
        <path d="M29.5 61 C31 50 32.5 39 35 27.5 L38.6 28.3 C36.6 39.5 35.8 50.5 35.8 61 Z" />
        {/* folhas */}
        <path d="M36.5 26 C29 17.5 17.5 16.5 7.5 24.5 C9 25.2 10.4 25 12 24.4 C10.6 26.6 10 28.8 10.2 31 C17.5 24.5 27 23 36.5 27.5 Z" />
        <path d="M36.5 25.5 C32 14.5 23 9 12 10.5 C13 11.6 14.3 12.1 15.8 12.2 C14.2 13.3 13.2 14.8 12.8 16.6 C21.5 14.5 30.5 18 36.5 26.5 Z" />
        <path d="M36.8 25 C37.2 15 42.5 7 52 4.2 C51.6 5.7 50.8 6.8 49.6 7.6 C51.4 7.8 52.9 8.5 54 9.8 C45.5 11.5 39.5 17 37.8 25.8 Z" />
        <path d="M37.2 25.6 C44.5 17.5 54.5 16 62 21.5 C60.6 22 59.3 22 58 21.6 C59.3 23 59.9 24.6 60 26.4 C52.5 22.2 44.5 22.6 37.6 26.8 Z" />
        <path d="M37.2 26.4 C46 25.2 53.5 30 56.5 38.5 C55.2 37.9 54.2 37 53.6 35.8 C53.3 37.6 52.5 39 51.2 40.2 C49.8 33 44.5 28.5 37 27.6 Z" />
        {/* cocos */}
        <circle cx="34.6" cy="29.6" r="2.4" />
        <circle cx="39.4" cy="30" r="2.4" />
        <circle cx="37" cy="32.4" r="2.2" />
      </g>
    </svg>
  );
}

export function LogoMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <span className={`${className} rounded-[10px] bg-brand-600 text-white flex items-center justify-center shrink-0`}>
      <PalmIcon className="w-[78%] h-[78%]" />
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
