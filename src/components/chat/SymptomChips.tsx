const CHIPS = [
  { label: 'Burn', text: 'I have a burn' },
  { label: 'Bleeding', text: 'Bleeding from a cut' },
  { label: 'Fever', text: 'I have a fever' },
];

/** Quick starters. They fill the input field and do not send. */
export function SymptomChips({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-semibold text-content-muted">Common symptoms</span>
      {CHIPS.map((c) => (
        <button
          key={c.label}
          onClick={() => onPick(c.text)}
          className="inline-flex h-11 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium leading-none text-content hover:border-primary hover:text-primary-hover active:bg-surface-tint"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
