// Retrieval eval for MediGo RAG. Offline, no network, no model calls.
// Run from the repo root: node scripts/rag-eval/run.mjs
// Needs Node 22.18+ (runs the .ts files directly).
import { readFileSync } from 'node:fs';
import { RagService } from '../../src/services/RagService.ts';
import { seedEmergencyCards } from '../../src/data/seed/emergencyCards.ts';

const queries = JSON.parse(readFileSync(new URL('./queries.json', import.meta.url), 'utf8'));

// Fake repo: RagService only needs getAll()
const rag = new RagService({ getAll: async () => seedEmergencyCards }, 3);

let top1 = 0, top3 = 0, answerable = 0, wrongSilence = 0, falsePositive = 0, shouldBeEmpty = 0;
const misses = [];
const top1Misses = [];

for (const { q, expect, note } of queries) {
  if (expect[0] === '*') continue; // section marker line in queries.json
  const names = (await rag.search(q)).map((c) => c.conditionName);
  if (expect.length === 0) {
    shouldBeEmpty++;
    if (names.length > 0) { falsePositive++; misses.push({ q, expect: '(nothing)', got: names, note }); }
    continue;
  }
  answerable++;
  if (names.length === 0) wrongSilence++;
  if (expect.includes(names[0])) top1++;
  else if (names.some((n) => expect.includes(n))) top1Misses.push({ q, expect, got: names, note });
  if (names.some((n) => expect.includes(n))) top3++;
  else misses.push({ q, expect, got: names, note });
}

const pct = (n, d) => `${n}/${d} (${d ? Math.round((100 * n) / d) : 0}%)`;
console.log(`Top-1 hit:            ${pct(top1, answerable)}`);
console.log(`Top-3 hit (recall):   ${pct(top3, answerable)}`);
console.log(`Empty on real case:   ${pct(wrongSilence, answerable)}`);
console.log(`False positives:      ${pct(falsePositive, shouldBeEmpty)}  (non-medical text that still matched)`);
if (misses.length) {
  console.log('\nMisses:');
  for (const m of misses) console.log(`- "${m.q}"\n    expected: ${[].concat(m.expect).join(' | ')}\n    got:      ${m.got.length ? m.got.join(', ') : '(nothing)'}${m.note ? `\n    note:     ${m.note}` : ''}`);
}
if (top1Misses.length) {
  console.log('\nRight card in top 3 but not first:');
  for (const m of top1Misses) console.log(`- "${m.q}"\n    expected: ${m.expect.join(' | ')}\n    got:      ${m.got.join(', ')}`);
}
