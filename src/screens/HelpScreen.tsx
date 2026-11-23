import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { SeverityBadge } from '../components/common/SeverityBadge';
import type { SeverityColor } from '../types/SeverityColor';
import type { SeverityLevel } from '../types/SeverityLevel';

const CARD = 'rounded-xl border border-border bg-surface p-6';
const CARD_TITLE = 'text-lg font-bold leading-7 text-content';

const STEPS: { icon: string; title: string; text: string }[] = [
  { icon: 'add', title: 'Start a New Check', text: 'Open New Check from the menu or the Dashboard.' },
  { icon: 'edit_note', title: 'Describe what happened', text: 'Type, speak or add a photo. Say where it hurts and how it happened.' },
  { icon: 'format_list_numbered', title: 'Read the result', text: 'You get a severity label and numbered first-aid steps to follow.' },
  { icon: 'bookmark_add', title: 'Save or find help', text: 'Save the check to your history, or open the map for the nearest facility.' },
];

const SEVERITY: { color: SeverityColor; level: SeverityLevel; text: string }[] = [
  { color: 'RED', level: 'HIGH', text: 'Serious. Get medical help now. Red - High is an emergency: call 112 and follow the steps while you wait.' },
  { color: 'YELLOW', level: 'MEDIUM', text: 'Needs care soon. Follow the first-aid steps and see a doctor or visit a health centre.' },
  { color: 'GREEN', level: 'LOW', text: 'Minor. Usually managed with first aid at home. Get help if it gets worse.' },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Does MediGo work offline?',
    a: 'Partly. AI replies need internet. When you are offline, MediGo says so and shows the closest first-aid steps from its built-in guide instead. Map tiles need internet to load.',
  },
  {
    q: 'Why does a result say it "could not analyse this reliably"?',
    a: 'The AI did not reply in time or its reply failed the safety checks. MediGo then shows safe default advice (Red - High: call 112 or go to the nearest hospital). Try again with a short, clear description.',
  },
  {
    q: 'What are the limits of photos?',
    a: 'Photos are shrunk before upload, and photo analysis may be turned off on the server. Always describe the problem in words as well; the photo alone may not be used.',
  },
  {
    q: 'What are the limits of voice input?',
    a: "Voice uses your browser's speech recognition, which not every browser has and some need internet for. It needs microphone permission. The text is put in the message box for you to check; nothing is sent until you press Send.",
  },
];

export function HelpScreen({ onStartCheck }: { onStartCheck: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold leading-10 text-content">Get Help</h1>
          <p className="mt-1 text-sm leading-5 text-content-muted">How to use MediGo and what the results mean.</p>
        </div>
        <Button icon="add" onClick={onStartCheck} className="px-6">
          Start a New Check
        </Button>
      </div>

      {/* Emergency first: one tap to call. */}
      <section className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-soft-cream p-6" aria-labelledby="emergency-title">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-content" aria-hidden="true">
          <Icon name="emergency" className="!text-2xl" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="emergency-title" className={CARD_TITLE}>
            Emergency number
          </h2>
          <p className="mt-1 text-sm leading-6 text-content">112 is India's national emergency number for ambulance, police and fire. It is free to call.</p>
        </div>
        <a
          href="tel:112"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold leading-none text-surface hover:bg-primary-hover"
        >
          <Icon name="call" className="!text-xl" />
          Call 112
        </a>
      </section>

      <section className={CARD} aria-labelledby="howto-title">
        <h2 id="howto-title" className={CARD_TITLE}>
          How to use MediGo
        </h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-lg bg-surface-tint p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold leading-none text-surface">{i + 1}</span>
                <Icon name={s.icon} className="!text-xl text-primary-hover" />
              </div>
              <h3 className="mt-3 text-sm font-semibold leading-5 text-content">{s.title}</h3>
              <p className="mt-1 text-sm leading-6 text-content-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className={CARD} aria-labelledby="severity-guide-title">
          <h2 id="severity-guide-title" className={CARD_TITLE}>
            Severity guide
          </h2>
          <p className="mt-1 text-sm leading-6 text-content-muted">
            Every result has a colour (Red, Yellow or Green) and a level (Low, Medium or High). The level shows how strong the concern is
            within that colour, so Red - High is the most urgent result.
          </p>
          <ul className="mt-5 divide-y divide-border">
            {SEVERITY.map((s) => (
              <li key={s.color} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:gap-4">
                <span className="flex sm:w-36 sm:shrink-0">
                  <SeverityBadge color={s.color} level={s.level} />
                </span>
                <p className="min-w-0 text-sm leading-6 text-content">{s.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={CARD} aria-labelledby="faq-title">
          <h2 id="faq-title" className={CARD_TITLE}>
            Questions
          </h2>
          <div className="mt-4 divide-y divide-border">
            {FAQ.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-3 text-sm font-semibold leading-5 text-content [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Icon name="expand_more" className="!text-xl text-content-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 text-sm leading-6 text-content-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-border bg-surface p-4 text-sm leading-6 text-content">
        <Icon name="info" className="!text-xl text-primary-hover" />
        MediGo gives first-aid guidance only. It is not a diagnosis and not a substitute for a doctor. In an emergency, call 112.
      </p>
    </div>
  );
}
