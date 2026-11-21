/** Material Symbols icon (font is bundled locally). Decorative unless a label is given. */
export function Icon({ name, className = '', label }: { name: string; className?: string; label?: string }) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  );
}
