// Smoke test for the triage proxy with real RAG context. No new dependencies (Node 22.18+ for fetch and .ts imports).
// Start the server first (cd server && npm run dev), then from server/: npm run smoke
// Options: TRIAGE_URL=http://localhost:8787/triage, SMOKE_OUT=path/to/results.md (writes the table as Markdown).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { RagService } from '../../src/services/RagService.ts';
import { seedEmergencyCards } from '../../src/data/seed/emergencyCards.ts';

const TRIAGE_URL = process.env.TRIAGE_URL ?? 'http://localhost:8787/triage';
const env = dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) }).parsed ?? {};

// Same rule as server/src/config.ts: a bad or missing value means 90 s. Wait a little longer than the server.
const serverTimeout = Number(env.MODEL_TIMEOUT_MS || 90_000);
const CLIENT_TIMEOUT_MS = (Number.isFinite(serverTimeout) && serverTimeout > 0 ? serverTimeout : 90_000) + 15_000;
const MIN_GAP_MS = 3_500; // at most ~17 requests a minute, under the server's 20/min limit
const FALLBACK = 'Unable to assess. Please seek medical help'; // ResponseValidator.fallback() condition

// Same search as the app: RagService over the seed cards, top 3.
const rag = new RagService({ getAll: async () => seedEmergencyCards }, 3);

/** History text in the same shape ChatScreen sends: "<condition>, <Color - Level>: <first steps>". */
const said = (condition, label, steps) => ({ role: 'assistant', text: `${condition}, ${label}: ${steps}` });

// expect = acceptable severityColors. Any case that allows RED fails the run if it comes back GREEN.
const cases = [
  { name: 'burn (small)', text: 'burn on my hand from hot water, small red area', expect: ['GREEN', 'YELLOW'] },
  { name: 'burn (large, child)', text: 'my son spilled boiling oil on his chest, big blisters', expect: ['RED', 'YELLOW'] },
  { name: 'severe bleeding', text: 'deep cut on my leg, blood will not stop', expect: ['RED'] },
  { name: 'choking', text: 'my baby is choking on a peanut and cannot breathe', expect: ['RED'] },
  { name: 'snakebite', text: 'bitten by a snake on my foot in the field', expect: ['RED'] },
  { name: 'fever', text: 'my child has a fever since two days', expect: ['YELLOW', 'GREEN'] },
  { name: 'fainting', text: 'my grandfather fainted for a few seconds and is now awake', expect: ['YELLOW', 'RED'] },
  { name: 'fracture', text: 'I think my wrist is broken after a fall', expect: ['YELLOW'] },
  { name: 'poisoning', text: 'child drank kerosene from a bottle', expect: ['RED'] },
  { name: 'heart attack', text: 'severe chest pain spreading to my left arm and sweating', expect: ['RED'] },
  { name: 'heart attack (Hinglish)', text: 'seene mein dard ho raha hai', expect: ['RED'] },
  { name: 'stroke', text: "my grandmother's face is drooping and her speech is slurred", expect: ['RED'] },
  { name: 'minor cut', text: 'small paper cut on my finger', expect: ['GREEN'] },
  { name: 'minor scrape', text: 'scraped my knee on the road, small graze', expect: ['GREEN'] },
  { name: 'insect sting (mild)', text: 'bee stung my arm, small swelling, no other problem', expect: ['GREEN', 'YELLOW'] },
  { name: 'heat stroke', text: 'worked in the sun all day, now confused and not sweating', expect: ['RED'] },
  { name: 'electric shock', text: 'touched a live wire, now he is not responding', expect: ['RED'] },
  { name: 'drowning', text: 'child nearly drowned in the pond, coughing now', expect: ['RED'] },
  { name: 'seizure', text: 'my son is having fits and shaking all over', expect: ['RED', 'YELLOW'] },
  { name: 'allergic reaction', text: 'ate prawns and now my lips and face are swelling up, hard to breathe', expect: ['RED'] },
  { name: 'pregnancy bleeding', text: 'my wife is pregnant and bleeding heavily', expect: ['RED'] },
  { name: 'vague', text: 'i dont feel good', expect: ['YELLOW', 'RED'] },
  { name: 'gibberish', text: 'asdf qwer zzzz', expect: ['YELLOW'] },
  { name: 'non-medical', text: 'how do I cook rice', expect: ['YELLOW'] },
  {
    name: 'follow-up: correction to GREEN',
    history: [
      { role: 'user', text: 'my son hit his head and is bleeding a lot' },
      said('Head injury with bleeding', 'Red - High', 'Call 112 (emergency services in India) now. Press a clean cloth on the wound.'),
    ],
    text: 'sorry, I was wrong. it is only a small scratch on his knee, his head is fine',
    expect: ['GREEN'],
  },
  {
    name: 'follow-up: escalation to RED',
    history: [
      { role: 'user', text: 'my father has mild chest discomfort' },
      said('Chest discomfort', 'Yellow - Medium', 'Help him sit and rest. Loosen tight clothing.'),
    ],
    text: 'now he is sweating a lot and the pain is going to his left arm',
    expect: ['RED'],
  },
  {
    name: 'follow-up: more detail',
    history: [
      { role: 'user', text: 'a stray dog bit my leg' },
      said('Animal bite', 'Yellow - High', 'Wash the wound with soap and clean running water for at least 15 minutes. Cover with a clean dressing.'),
    ],
    text: 'the wound is small and not bleeding much',
    expect: ['YELLOW', 'RED'],
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rows = [];
let lastStart = 0;

for (const c of cases) {
  const history = c.history ?? [];
  // Like TriageService: search with earlier user messages plus the new text, send name + steps only.
  const searchText = [...history.filter((h) => h.role === 'user').map((h) => h.text), c.text].join(' ');
  const cards = await rag.search(searchText);
  const context = cards.map((k) => ({ conditionName: k.conditionName, severityGuidance: k.severityGuidance }));

  await sleep(Math.max(0, lastStart + MIN_GAP_MS - Date.now()));
  lastStart = Date.now();
  const row = { ...c, refs: cards.map((k) => k.conditionName), got: '-', condition: '', ms: 0, status: 'ERROR' };
  try {
    const res = await fetch(TRIAGE_URL, {
      method: 'POST',
      // Node sends no Origin header, so the server's CORS rule does not block it.
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: c.text, context, history }),
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
    });
    const body = await res.json();
    row.ms = Date.now() - lastStart;
    if (!res.ok) row.condition = `HTTP ${res.status}: ${body.error ?? 'error'}`;
    else {
      row.got = body.severityColor;
      row.condition = body.condition;
      row.status = body.condition === FALLBACK ? 'FALLBACK' : c.expect.includes(body.severityColor) ? 'PASS' : 'FAIL';
    }
  } catch (err) {
    row.ms = Date.now() - lastStart;
    row.condition = `request failed: ${err instanceof Error ? err.message : err}`;
  }
  row.redToGreen = c.expect.includes('RED') && row.got === 'GREEN';
  rows.push(row);
  console.log(`${row.status.padEnd(8)} ${c.name.padEnd(32)} expect ${c.expect.join('/').padEnd(12)} got ${String(row.got).padEnd(6)} ${(row.ms / 1000).toFixed(1)}s  ${row.condition}`);
}

// Summary
const count = (s) => rows.filter((r) => r.status === s).length;
const timed = rows.filter((r) => r.status !== 'ERROR').map((r) => r.ms).sort((a, b) => a - b);
const avg = timed.length ? timed.reduce((a, b) => a + b, 0) / timed.length : 0;
const median = timed.length ? timed[Math.floor(timed.length / 2)] : 0;
const redToGreen = rows.filter((r) => r.redToGreen);
const summary = [
  `Pass: ${count('PASS')}/${rows.length}, fail: ${count('FAIL')}, fallback: ${count('FALLBACK')}, error: ${count('ERROR')}`,
  `RED case answered GREEN: ${redToGreen.length}${redToGreen.length ? ` (${redToGreen.map((r) => r.name).join(', ')})` : ''}`,
  `Latency: average ${(avg / 1000).toFixed(1)} s, median ${(median / 1000).toFixed(1)} s, max ${((timed.at(-1) ?? 0) / 1000).toFixed(1)} s`,
];
console.log(`\n${summary.join('\n')}`);

if (process.env.SMOKE_OUT) {
  const cell = (s) => String(s).replace(/\|/g, '\\|');
  const md = [
    '| # | Case | Expected | Got | Result | Time (s) | Model condition | REFERENCE cards sent |',
    '|---|---|---|---|---|---|---|---|',
    ...rows.map((r, i) => `| ${i + 1} | ${cell(r.name)} | ${r.expect.join(' / ')} | ${r.got} | ${r.status}${r.redToGreen ? ' ⚠ RED→GREEN' : ''} | ${(r.ms / 1000).toFixed(1)} | ${cell(r.condition)} | ${cell(r.refs.join(', ') || '(none)')} |`),
    '',
    ...summary.map((s) => `- ${s}`),
  ].join('\n');
  writeFileSync(process.env.SMOKE_OUT, `${md}\n`);
  console.log(`\nTable written to ${process.env.SMOKE_OUT}`);
}

// Exit 1 when a case that may be RED came back GREEN (the dangerous direction).
process.exitCode = redToGreen.length ? 1 : 0;
