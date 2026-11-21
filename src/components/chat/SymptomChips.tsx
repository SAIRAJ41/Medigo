const CHIPS = [
  { label: 'Burn', text: 'I have a burn' },
  { label: 'Bleeding', text: 'Bleeding from a cut' },
  { label: 'Fever', text: 'I have a fever' },
];

/** Quick starters. They fill the input field and do not send. */
export function SymptomChips({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-content-muted">Common:</span>
      {CHIPS.map((c) => (
        <button key={c.label} onClick={() => onPick(c.text)} className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-content hover:bg-primary hover:text-white">
          {c.label}
        </button>
      ))}
    </div>
  );
}
