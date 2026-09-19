# DN Tech — AI Chatbot Feature Review (2026-09-19)

> **Status:** Resolved (2026-09-19, same day) · **Last updated:** 2026-09-19 · **Author:** Dozer

## Resolution Update (2026-09-19)

All findings below were fixed in commit `1584f7d`. Summary of what changed:

- **Bug Triage #1–#5:** all fixed in `backend/src/services/ChatbotService.ts` — `isCodingRequest()` now requires a coding action verb paired with a generic tech noun (strong signals like "debug"/"syntax error" still trigger alone); `conversationId` ownership is checked, falling back silently to a fresh conversation on mismatch instead of exposing another visitor's history; the Gemini call was extracted into `callGeminiChat()` with a 20s `AbortController` timeout; corrupted history entries are now dropped per-message instead of crashing the request; the frontend's client-side `messages` array is capped at `MAX_CLIENT_MESSAGES = 20` to match the backend.
- **QA/Test Review:** added `backend/src/__tests__/services/ChatbotService.test.ts` — 20 tests covering `isCodingRequest`, `extractText`, and `answerChat` (coding refusal, cross-visitor ownership fallback, 404, corrupted-history recovery, Gemini timeout, missing API key). Full backend suite (124 tests) and frontend suite (104 tests) both green; `tsc`/`next build` clean on both sides.
- **Design System Review:** all 4 token deviations fixed in `frontend/src/components/interactive/AIChatbot.tsx` — header `bg-blue-950` → `bg-blue-900`, radius `rounded-2xl`/`rounded-xl` → `rounded-lg`, focus states switched to the ring-based `focus:ring-2` pattern (with an explicit white ring + `ring-offset-blue-900` on the header's close button for contrast), message input gained `min-h-[48px]`, footer disclaimer bumped to `text-xs text-gray-600` for contrast/legibility.

**Not yet deployed to production** — see deploy steps at the bottom of this doc.

---

## Original Summary

Combined review of the public-facing AI chatbot widget (`dntech.id`) across three lenses: bug triage, test/QA coverage, and design-system consistency. Files in scope:

- `backend/src/routes/chat.ts`
- `backend/src/services/ChatbotService.ts`
- `frontend/src/components/interactive/AIChatbot.tsx`

**Headline:** the feature works and is reasonably well-built (input validation, rate limiting, coding-topic guardrail, good ARIA, responsive layout), but has **zero automated tests**, **two access-control-relevant bugs** (false-positive refusal on legitimate product questions, and a missing ownership check on `conversationId`), and **visible drift from the site's design tokens**.

| Review | P0/P1 findings | P2 findings | P3/Trivial |
|---|---|---|---|
| Bug Triage | 2 (Major) | 1 (Major) | 2 (Minor/Trivial) |
| QA/Test Review | Coverage gap (0%) — no severity scale, treated as a P1-equivalent gap | — | — |
| Design System | — | 4 token deviations | 1 contrast note |

---

## 1. Bug Triage (`/ai-bug-triage`)

Static review pass — no CI/production failure logs existed yet for this feature, so classification is based on code inspection rather than fingerprinted incidents.

| # | Severity/Priority | Finding | Location |
|---|---|---|---|
| 1 | **Major / P1** | `isCodingRequest()` false-positives on legitimate product questions. Regex blocks generic words (`api`, `script`, `class`, `function`, `query database`), so a real customer question like *"dnCore ada API untuk integrasi ga?"* gets wrongly refused with the coding-refusal message, even though DN Tech's own products are API/integration-focused. | `backend/src/services/ChatbotService.ts:28` |
| 2 | **Major / P1** | No ownership check on `conversationId`. Backend loads any conversation by UUID (`findUnique`) without verifying `visitorId` matches the conversation's original owner — broken access control. Anyone who obtains another visitor's `conversationId` can read/append to their chat history. | `backend/src/services/ChatbotService.ts:81-84` |
| 3 | **Major / P2** | No timeout on the Gemini `fetch()` call, on either backend or frontend. A slow/hung Gemini response leaves the "Sedang mencari jawaban…" state stuck indefinitely with no recovery. | `backend/src/services/ChatbotService.ts:115-129`; `frontend/src/components/interactive/AIChatbot.tsx:86` |
| 4 | **Minor / P2** | Corrupted or legacy-shaped message history in the DB throws uncaught during `messageSchema.parse()`, permanently breaking that `conversationId` for the affected visitor (it's cached in their `localStorage` and reused on every request). | `backend/src/services/ChatbotService.ts:86-87` |
| 5 | **Trivial / P3** | Client-side `messages` state array is never trimmed, growing unbounded across a long session/localStorage — diverges from the server's `MAX_HISTORY = 20` cap (cosmetic/memory only, no functional impact). | `frontend/src/components/interactive/AIChatbot.tsx:93` |

**Recommended fix order:** #1 and #2 first (customer-facing correctness + access control), then #3 (resilience), #4 (defensive parsing), #5 (low priority cleanup).

---

## 2. QA / Test Coverage Review (`/ai-qa-review`)

**Coverage: 0%.** Confirmed no test files exist for this feature on either side:

- Backend: nothing under `backend/src/__tests__/services/` or `.../integration/` for `ChatbotService` or `chat` route (compare to existing `LeadService.test.ts`, `products.route.test.ts`, etc., which do exist for other features).
- Frontend: nothing under `frontend/src/__tests__/` or `frontend/e2e/` for `AIChatbot`.

### Testability findings

| Area | Finding | Recommendation |
|---|---|---|
| `answerChat()` | Mixes Prisma queries, business logic, and a raw `fetch()` call to Gemini in one 65-line function — no seam to mock just the Gemini call in isolation. | Extract a standalone `callGemini(...)` function (also the natural place to add the timeout from Bug Triage #3). |
| Prisma access | Already testable via the project's established pattern — `jest.mock('../../config/database', ...)` (see `LeadService.test.ts:1-18`) applies directly since `ChatbotService.ts` imports `prisma` the same way. | Reuse existing mock convention, no new pattern needed. |
| `isCodingRequest()` / `extractText()` | Pure functions, no I/O — easiest and highest-value to test first, since a test here doubles as a **regression test for Bug Triage finding #1**. | Write `it.each` cases covering both legitimate product/API questions (should NOT trigger refusal) and actual coding requests (should trigger it). |
| Frontend `AIChatbot.tsx` | `fetch`, `localStorage`, and `crypto.randomUUID()` are called inline with no extracted hook — would need to mock all three at once to test `submit()`. | Consider extracting a `useChatSession()` hook if test coverage is prioritized here; not blocking. |
| `renderMessage` / `renderInlineMarkdown` | Pure, easy to test as-is (bold/italic/bullet parsing). | Add directly, no refactor needed. |

**Suggested first PR:** unit tests for `isCodingRequest()` + `extractText()` (zero mocking required, directly proves/fixes Bug Triage #1), then an integration test for the `POST /admin/blog/generate`-style route pattern already used elsewhere for `chat.ts`.

---

## 3. Design System Review (`/ui-design-system`)

Baseline: `frontend/src/components/ui/Button.tsx`, `Card.tsx`, `Input.tsx`, `Toast.tsx`.

### What's already good
- ARIA is more complete than several other interactive components in the codebase: `aria-label`, `aria-expanded` on the toggle button, `aria-live="polite"` on the message list.
- Responsive sizing (`w-[min(390px,calc(100vw-2rem))]`, `h-[min(620px,calc(100vh-110px))]`) follows the exact same safe-margin `min()` clamp pattern as `Toast.tsx` — no horizontal overflow risk on mobile.
- Message rendering uses plain React text nodes (no `dangerouslySetInnerHTML`) — no XSS surface in rendered chat content.

### Token deviations

| Element | Established token | Used in chatbot | Fix |
|---|---|---|---|
| Header background | `bg-blue-900` (brand primary, used by `Button` primary variant, `Input` focus) | `bg-blue-950` | Change to `bg-blue-900` |
| Panel/bubble radius | `rounded-lg` (all of `Button`, `Card`, `Input`, `Toast`) | `rounded-2xl` (panel), `rounded-xl` (bubbles) | Align to `rounded-lg`, or document as a deliberate chat-bubble exception |
| Focus states | Ring-based: `focus:ring-2 focus:ring-offset-2` + brand color (`Button`, `Input`) | Outline-based: `focus-visible:outline focus-visible:outline-2` | Standardize on the ring-based pattern for consistency; at minimum give the close button (on a dark `blue-950` header) an explicit contrasting outline color |
| Message input | `min-h-[44px]`/`[48px]` touch target on every other form field (`Input`, `Select`, `Button`) | No minimum height set | Add `min-h-[48px]` to match |

### Accessibility note
Footer disclaimer text ("AI dapat keliru...") uses `text-gray-500` at `text-[11px]` — contrast is borderline AA (~4.6:1) and the font size is below the common 12px legibility floor. Recommend `text-gray-600` and/or bumping to `text-xs` (12px).

### Not chatbot-specific (broader gap)
No centralized z-index token scale exists in the codebase — `Toast.tsx` uses `z-[100]`, this widget uses `z-[60]`, other modals use `z-40`/`z-50`, all ad-hoc. Worth a follow-up ticket independent of this feature.

---

## Recommended Action Plan

1. **P1 — this sprint:** Fix `isCodingRequest()` false positives (#1) and add the `conversationId` ownership check (#2).
2. **P2 — this sprint if possible:** Add fetch timeout (#3), defensive parsing for corrupted history (#4).
3. **P2 — parallel:** Write the zero-mock unit tests for `isCodingRequest()`/`extractText()` as regression coverage for #1.
4. **P3 — next sprint:** Align chatbot visual tokens (header color, radius, focus states, input touch target) to the established design system.

All 4 items above are done as of the Resolution Update. Remaining action is deployment.

## Deploy Steps

```bash
cd ~/dntech/backend
git pull
npm ci
npm run build
pm2 restart dntech-api

cd ~/dntech/frontend
git pull
npm ci
npm run build
PORT=3000 pm2 restart dntech-web --update-env
```
