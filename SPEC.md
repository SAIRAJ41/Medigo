# MediGo - Project Spec

AI first-aid triage assistant for rural India. Web app, also wrapped as an Android app. This file is the single source of truth. Follow it exactly. Do not add features that are not listed. Keep code minimal and clean, with short inline comments.

## 1. Stack
- Front end: React + Vite + TypeScript, built as a PWA.
- Android: Capacitor wrapping the same web build (last phase only).
- Backend: small Node + Express proxy. It is the ONLY place that holds the AI API key.
- AI: Gemma 4 31B through the Gemini API (free tier). Model name and API key live in environment variables, never in front-end code. Do not hardcode the model ID.
- Local storage: IndexedDB through Dexie.
- Map: Leaflet with OpenStreetMap tiles, with tile caching for offline use.
- Desktop app: out of scope (on hold).

## 2. Screens (exactly 6)
1. **Dashboard**: greeting, stats row (total checks, last check, nearest facility), severity pie chart, 5 most recent cases.
2. **Chat**: input bar with a + button (attach photo), a text field and a mic button. After a triage reply it shows a result card: severity badge, condition, numbered first-aid steps, and two buttons: "Find Nearest Facility" and "Save to History".
3. **Map**: list of facilities plus map, nearest facility highlighted.
4. **Login**: centered card, email and password (show/hide), "Sign in", link to Sign Up. No "Forgot password" (local accounts cannot be recovered); a note says accounts are stored on this device only. After 5 wrong attempts sign-in locks for 30 seconds with a visible countdown.
5. **Sign Up**: full name, email, password (min 8 characters, live strength hint), confirm password. On success the user is signed in and taken to the Dashboard.
6. **Profile**: avatar with initials, name and email; editable details (full name, phone, emergency contact name and phone; email read-only); change password; sign out; delete account with a confirmation dialog.

Navigation: top-left three-line drawer menu. No bottom navigation bar. Back arrow on Chat, Map and Profile. Local on-device accounts; server accounts later. Signed out, only Login and Sign Up are shown (top bar with wordmark, Demo badge and 112 chip, no menu). Signed in, the top bar has a round initials button that opens Profile, and the drawer has Profile and Sign out.

## 3. Severity system
- Three categories: Red, Yellow, Green. Each has a level: Low, Medium, High. Total 9 tiers.
- Label format: "Red - High".
- Every badge shows the text label AND an icon, never color alone.

## 4. Colors
Define as CSS variables. Never hardcode hex values in components.

| Variable | Hex | Use |
|---|---|---|
| --color-primary | #397BA8 | Filled buttons, active menu item, headings, links. White text only. |
| --color-primary-hover | #2F6A93 | Hover and pressed state of primary buttons. |
| --color-bg-tint | #E8F1F8 | Cards, info panels, stats row, AI reply bubbles. |
| --color-bg | #F8FAFC | Main page background. |
| --color-surface | #FFFFFF | Input bar, modals, raised cards. |
| --color-text | #263746 | All body text and headings. |
| --color-text-muted | #5B6B7A | Secondary text (timestamps, hints). |
| --color-accent | #B9D5E8 | Fills only: chips, highlights, borders, user chat bubbles. Never for text. |
| --color-border | #D5E1EA | Dividers and input outlines. |

Severity colors (separate from the brand palette):

| Category | Solid | Tint (badge background) | Text on solid |
|---|---|---|---|
| Red | #C62828 | #FDECEA | White |
| Yellow | #F9A825 | #FFF4D6 | #263746 (dark) |
| Green | #2E7D32 | #E6F4E8 | White |

Rules:
- White text only on primary, red solid and green solid.
- Never use the brand blue for a severity badge.
- Never place text or thin icons in accent #B9D5E8 on a light background.
- Primary #397BA8 is for buttons, headings and large text, not small body text.
- Severity colors are used only for severity badges, the donut chart and the Red - High emergency card. Approved exception: severity red (--color-severity-red) is also used for form error text (with an error icon) and the 2 px border of an invalid input. Never for buttons or anything else.

## 5. How triage works
1. The user sends text, a photo, or voice (voice is transcribed to text first).
2. The app searches the local knowledge base (EmergencyCard entries) and takes the top 3 matches as context. Works offline.
3. The app POSTs `{text, image (optional), context, history (optional)}` to the proxy at `/triage`. `history` holds the recent messages of the current check (max 6, text only, never old photos), so follow-ups and corrections are understood; "Start a new check" clears it.
4. The proxy builds ONE prompt text (role + rules + required JSON schema + up to 3 context entries + the user report inside delimiters; no system instruction or JSON mode, since Gemma may not support them), calls the model (60 s timeout, `MODEL_TIMEOUT_MS`; the app waits 70 s), and validates the reply. Images reach the model only when `ENABLE_IMAGES=true`.
5. The model must return ONLY this JSON:
   `{"condition": string, "severityColor": "RED"|"YELLOW"|"GREEN", "severityLevel": "LOW"|"MEDIUM"|"HIGH", "steps": string[], "seekFacility": boolean}`
6. If the reply is missing, malformed or fails validation, the proxy returns a safe fallback: RED / HIGH, steps telling the user to call emergency services (112 in India) or go to the nearest hospital.
7. Severity and steps come from the model for each input. Never hardcode canned responses per severity tier.
8. The result card shows a short disclaimer: this is guidance, not a substitute for a doctor or emergency care.

## 6. Offline behavior
- Works offline: history, knowledge base search, saved hospitals, cached map tiles, dashboard.
- Needs internet: AI reply and photo analysis.
- If offline when the user sends a message: show a clear message and still show the matched knowledge base steps for the closest condition.

## 7. Data model (IndexedDB stores)
- `cases`: caseId, inputText, inputImagePath, severityColor, severityLevel, guidance, timestamp
- `hospitals`: hospitalId, name, latitude, longitude, address
- `emergency_cards`: cardId, conditionName, severityGuidance
- `users` (localStorage for now, moves here later): userId, fullName, email, phone, emergencyContactName, emergencyContactPhone, createdAt, passwordSalt, passwordHash, passwordIterations

Seed data:
- `emergency_cards`: 15 common conditions (burns, bleeding, choking, fracture, snakebite, fever, heat stroke, poisoning, etc.), one entry per condition.
- `hospitals`: small sample list of Goa facilities. To be replaced later with a full dataset.

## 8. Code structure (use these names)
- Screens: AppShell, DashboardScreen, ChatScreen, MapScreen, LoginScreen, SignUpScreen, ProfileScreen
- Services: TriageService, RagService, VoiceService, ApiClient, OfflineMapService, AuthService (IAuthService)
- Data: CaseRepository, HospitalRepository, LocalDatabase, UserRepository (IUserRepository, LocalUserRepository), SessionStore (ISessionStore, LocalSessionStore)
- Context: ServicesContext, AuthContext (useAuth)
- Form components: components/forms (TextField, PasswordField, PasswordStrength, FormError, AuthCard, useFormState); components/common ConfirmDialog
- Server (`server/`, Express + TypeScript, run with tsx): `src/index.ts`, `src/config.ts`, `src/controllers/TriageController.ts`, `src/services/PromptBuilder.ts`, `src/services/ModelClient.ts`, `src/services/ResponseValidator.ts`; `scripts/smoke-test.mjs`
- Front-end flags (`src/config/env.ts`): `IS_DEMO_MODE` (mock storage, Demo data badge) and `USE_REAL_TRIAGE` (`VITE_USE_REAL_TRIAGE=true`: Chat uses the real ApiClient and proxy; otherwise MockApiClient)
- Types: TriageQuery, TriageResult, Case, Hospital, EmergencyCard, DashboardStats, SeverityColor, SeverityLevel, InputType, User

Rules:
- Screens never touch storage or the network directly. They call services and repositories only.
- Only ModelClient (server side) holds the API key.
- Only ApiClient talks to the server.
- Only repositories and RagService access LocalDatabase.
- Only UserRepository and SessionStore touch account storage; screens use AuthContext only.

## 9. Behavior rules (state logic)
Triage case lifecycle: Draft -> Submitted -> Awaiting AI -> Result Ready | Fallback Result; or Submitted -> Offline Guidance (when offline). Any result can then be Saved or Discarded. A Saved case can later be Deleted from history.
- A message cannot be sent with no input.
- `sendRequest` goes to Awaiting AI when online and to Offline Guidance when offline.
- Awaiting AI always ends in a result: a failed or invalid reply or a timeout goes to Fallback Result.
- A case cannot be saved before a result exists.
- Deleting a case needs a confirmation step.
- Voice: if transcription is not available, show a message asking the user to type. Transcribed text is inserted into the input field, not sent automatically.
- Nearest facility: if location permission is denied or the position fails, still show the facility list without distance ordering. If no facility data exists, show a clear message.
- Accounts (local, on-device convenience, not real security): email is normalized to lowercase and must be unique; passwords are hashed with PBKDF2 (Web Crypto) with a random salt per user, only salt and hash are stored and compared in constant time; the session stores only the userId and survives reload; 5 wrong sign-ins lock sign-in for 30 seconds. Server-side auth replaces this later behind the same interfaces.

## 10. Build phases
Finish one phase, then STOP and wait for "next".
1. Project scaffold, CSS variables, and the Express proxy with `/triage`, PromptBuilder, ModelClient, ResponseValidator. Test with a plain request and show the output.
2. Chat screen with text input and the result card, connected to the proxy.
3. LocalDatabase, repositories, RagService with the seed data, Save to History.
4. Dashboard screen and Map screen with the drawer menu.
5. Photo input, voice input (graceful fallback if transcription is unavailable), PWA offline support, map tile caching.
6. Capacitor Android wrapper.

## 11. Out of scope
Desktop app, video input, social features, fine-tuning, hardcoded per-severity responses.

## 12. Security
- The API key and model ID live only in the server's `.env` file (`server/.env`, template `server/.env.example`). The server exits at startup if either is missing and never logs the key, the user's text or image, or the raw model output.
- `.env` must be in `.gitignore` before the first commit.
- The front end must never contain the API key.
