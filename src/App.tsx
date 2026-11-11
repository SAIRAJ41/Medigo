export default function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-surface-bg text-content flex flex-col">
      <header className="w-full bg-surface border-b border-border h-14 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-content hover:bg-surface-tint transition-colors"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[26px]">add_circle</span>
            <span className="text-xl font-bold text-primary tracking-tight">MediGo</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-tint text-primary text-xs font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Demo data</span>
          </div>
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-severity-red-tint text-severity-red font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
            <span>112 EMERGENCY</span>
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-content tracking-tight">
            MediGo Scaffold & Token Setup Initialized
          </h1>
          <p className="text-sm text-content-muted mt-2">
            Step 1 verification: React + Vite + TypeScript, bundled Inter typography, bundled Material Symbols, CSS variables from colors.md mapped through Tailwind theme.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-severity-red-tint text-severity-red">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>RED - HIGH</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-severity-yellow-tint text-content">
              <span className="material-symbols-outlined text-[16px] text-severity-yellow">warning</span>
              <span>YELLOW - MEDIUM</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-severity-green-tint text-severity-green">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>GREEN - LOW</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

