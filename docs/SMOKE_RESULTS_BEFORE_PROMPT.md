# Smoke test results: BEFORE the prompt change (step E)

Run on 2026-11-24 against the local server (`gemma-4-31b-it`), current `PromptBuilder.ts`, knowledge base v4.
Each case sends the top 3 RagService cards as REFERENCE, like the app. Command: `cd server && npm run smoke` (with `SMOKE_OUT` set).

**Read this first:** all 16 FALLBACK rows were **HTTP 503 from the Gemini API** ("This model is currently experiencing high demand").
The server log shows exactly 16 of these errors. They are not invalid model replies. The server correctly returned the safe RED fallback.
So this run measures only **11 real answers**, and the fallback rows say nothing about prompt quality.

## Summary

- Real answers: 11/27. **All 11 passed** (expected severity matched). Wrong severity: 0.
- Fallback (API 503, overloaded): 16/27.
- **RED case answered GREEN: 0.** Exit code 0.
- Latency of the 11 real answers: **average 48.2 s**, min 37.3 s, max 58.6 s. The script's own average of 24.9 s is lower only because it includes the instant 503 failures.
- Note: the effective server model timeout is 60 s (see below), so the slowest replies were close to the limit.

## Per case

| # | Case | Expected | Got | Result | Time (s) | Model condition | REFERENCE cards sent |
|---|---|---|---|---|---|---|---|
| 1 | burn (small) | GREEN / YELLOW | RED | FALLBACK | 1.6 | Unable to assess. Please seek medical help | Burns, Chemical burn, Minor burn |
| 2 | burn (large, child) | RED / YELLOW | RED | FALLBACK | 0.9 | Unable to assess. Please seek medical help | Burns, Chest injury, Heart attack |
| 3 | severe bleeding | RED | RED | FALLBACK | 0.8 | Unable to assess. Please seek medical help | Severe bleeding, Minor cut or scrape |
| 4 | choking | RED | RED | FALLBACK | 15.9 | Unable to assess. Please seek medical help | Choking, Fever in a baby |
| 5 | snakebite | RED | RED | FALLBACK | 1.0 | Unable to assess. Please seek medical help | Snakebite, Animal bite |
| 6 | fever | YELLOW / GREEN | RED | FALLBACK | 46.0 | Unable to assess. Please seek medical help | Fever, Fever in a baby |
| 7 | fainting | YELLOW / RED | RED | FALLBACK | 1.1 | Unable to assess. Please seek medical help | Fainting |
| 8 | fracture | YELLOW | RED | FALLBACK | 1.1 | Unable to assess. Please seek medical help | Fracture or sprain |
| 9 | poisoning | RED | RED | PASS | 58.4 | Kerosene poisoning | Poisoning |
| 10 | heart attack | RED | RED | PASS | 58.6 | Possible Heart Attack | Heart attack, Chest injury, Hypoglycaemia |
| 11 | heart attack (Hinglish) | RED | RED | PASS | 45.6 | Chest Pain | Heart attack |
| 12 | stroke | RED | RED | FALLBACK | 24.6 | Unable to assess. Please seek medical help | Stroke |
| 13 | minor cut | GREEN | GREEN | PASS | 46.4 | Minor paper cut | Minor cut or scrape, Severe bleeding |
| 14 | minor scrape | GREEN | RED | FALLBACK | 25.8 | Unable to assess. Please seek medical help | Minor cut or scrape |
| 15 | insect sting (mild) | GREEN / YELLOW | GREEN | PASS | 47.4 | Bee sting | Insect sting, Scorpion sting |
| 16 | heat stroke | RED | RED | FALLBACK | 1.4 | Unable to assess. Please seek medical help | Heat stroke, Heart attack, Hypoglycaemia |
| 17 | electric shock | RED | RED | PASS | 47.5 | Electric shock | Electric shock |
| 18 | drowning | RED | RED | PASS | 38.2 | Near-drowning | Drowning |
| 19 | seizure | RED / YELLOW | RED | FALLBACK | 0.8 | Unable to assess. Please seek medical help | Seizure |
| 20 | allergic reaction | RED | RED | FALLBACK | 17.4 | Unable to assess. Please seek medical help | Allergic reaction |
| 21 | pregnancy bleeding | RED | RED | FALLBACK | 1.0 | Unable to assess. Please seek medical help | Pregnancy emergency, Severe bleeding, Nosebleed |
| 22 | vague | YELLOW / RED | YELLOW | PASS | 44.1 | Unclear report | (none) |
| 23 | gibberish | YELLOW | YELLOW | PASS | 37.3 | Unclear report | (none) |
| 24 | non-medical | YELLOW | RED | FALLBACK | 1.0 | Unable to assess. Please seek medical help | (none) |
| 25 | follow-up: correction to GREEN | GREEN | GREEN | PASS | 49.0 | Small scratch on knee | Head injury, Severe bleeding, Animal bite |
| 26 | follow-up: escalation to RED | RED | RED | FALLBACK | 0.8 | Unable to assess. Please seek medical help | Heart attack, Chest injury, Hypoglycaemia |
| 27 | follow-up: more detail | YELLOW / RED | YELLOW | PASS | 57.6 | Animal bite | Severe bleeding, Animal bite, Nosebleed |


Script output line: Pass 11/27, fail 0, fallback 16, error 0; RED→GREEN 0; latency average 24.9 s, median 24.6 s, max 58.6 s (includes the 503s).

## Environment notes

- `server/.env` has text pasted directly after `MODEL_TIMEOUT_MS=120000` on the same line, so the value does not parse as a number. Both the server and this script fall back to **60 s**. Fix the `.env` line if 120 s was intended. The app (`ApiClient`) waits 70 s.
