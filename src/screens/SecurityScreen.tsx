import { ChangePasswordCard } from '../components/account/ChangePasswordCard';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';

const CARD = 'rounded-xl border border-border bg-surface p-6';

// Plain statements of what the code does today. No encryption is claimed: there is none on the device.
const FACTS: { icon: string; title: string; text: string }[] = [
  {
    icon: 'smartphone',
    title: 'Saved checks stay on this device',
    text: 'Your check history is kept in this browser only. It is not uploaded or shared.',
  },
  {
    icon: 'person',
    title: 'Your account is local',
    text: 'Your profile is stored in this browser. The password is never stored as text: only a salted PBKDF2 hash is kept. Anyone using this device and browser can still open the stored data, so this is a convenience, not strong security.',
  },
  {
    icon: 'vpn_key',
    title: 'The AI key stays on the server',
    text: 'MediGo talks to the AI model through its own server. The API key lives only there and never reaches your browser.',
  },
  {
    icon: 'visibility_off',
    title: 'Your words are not logged',
    text: "Your description is sent to MediGo's own server only to get the AI result. The server does not store or log what you write.",
  },
];

export function SecurityScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-3xl font-bold leading-10 text-content">Security</h1>
        <p className="mt-1 text-sm leading-5 text-content-muted">Your password, signing out, and how your data is handled.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ChangePasswordCard />
          <section className={`${CARD} flex flex-wrap items-center justify-between gap-4`} aria-labelledby="signout-title">
            <div className="min-w-0">
              <h2 id="signout-title" className="text-lg font-bold leading-7 text-content">
                Sign out
              </h2>
              <p className="mt-1 text-sm leading-5 text-content-muted">Your account and saved checks stay on this device.</p>
            </div>
            <Button variant="outline" icon="logout" onClick={onSignOut}>
              Sign out
            </Button>
          </section>
        </div>

        <section className={CARD} aria-labelledby="data-handling-title">
          <h2 id="data-handling-title" className="flex items-center gap-2 text-lg font-bold leading-7 text-content">
            <Icon name="shield" className="!text-xl text-primary-hover" />
            How your data is handled
          </h2>
          <ul className="mt-5 space-y-5">
            {FACTS.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft-sage text-content" aria-hidden="true">
                  <Icon name={f.icon} className="!text-xl" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold leading-5 text-content">{f.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-content-muted">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
