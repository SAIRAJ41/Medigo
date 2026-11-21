// Smoke test for the triage proxy. No dependencies (Node 18+ has fetch).
// Start the server first (cd server && npm run dev), then: node scripts/smoke-test.mjs
// Optional: TRIAGE_URL=http://localhost:8787/triage node scripts/smoke-test.mjs

const URL = process.env.TRIAGE_URL ?? 'http://localhost:8787/triage';

const inputs = [
  'burn on my hand from hot water',
  'bitten by a snake on my foot',
  'paper cut on my finger',
  'choking and cannot breathe',
  'my child has a fever since two days',
  'asdf qwer zzzz',
];

let failures = 0;

for (const text of inputs) {
  try {
    const res = await fetch(URL, {
      method: 'POST',
      // The server only allows the app's origin; Node sends no Origin header, so CORS does not block it.
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, context: [] }),
    });
    const body = await res.json();
    if (!res.ok) {
      failures++;
      console.log(`\n> ${text}\n  HTTP ${res.status}: ${body.error ?? 'error'}`);
      continue;
    }
    console.log(`\n> ${text}`);
    console.log(`  condition:  ${body.condition}`);
    console.log(`  severity:   ${body.severityColor} - ${body.severityLevel}${body.seekFacility ? ' (seek facility)' : ''}`);
    console.log(`  first step: ${body.steps?.[0] ?? '(none)'}`);
  } catch (err) {
    failures++;
    console.log(`\n> ${text}\n  request failed: ${err instanceof Error ? err.message : err}`);
  }
}

console.log(failures ? `\n${failures} request(s) failed.` : '\nAll requests answered.');
process.exitCode = failures ? 1 : 0;
