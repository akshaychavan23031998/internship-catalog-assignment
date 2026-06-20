# Take-Home Assignment — Full-Stack Engineer

Welcome, and thanks for taking the time to do this assignment. Read this entire document before you start coding. If anything is unclear, reach out — we would rather answer questions than have you guess.

---

## TL;DR

You have been given a **working Next.js + Node.js + MongoDB** application — an internship catalog. Your job is to:

1. **Find and fix the bugs** that we have planted in this codebase. There are roughly **5 bugs** spread across the frontend and the backend. Some are subtle.
2. **Build two new features**:
   - **Save for later** — let users bookmark internships and view them on a dedicated page.
   - **Find your internship** — an AI-powered matcher that recommends internships based on a short user profile.
3. **Write a short README** of what you did, why, and what you would do next.

---

## Time box

- **Target:** 6 to 8 hours of focused work.
- **Hard cap:** please do not spend more than **10 hours**. If you run out of time, submit what you have and call out the gaps in your README. Knowing when to stop is part of what we are evaluating.
- You have **5 days** from receiving this assignment to submit.

---

## Setup

Follow **README.md** to get the app running locally. You should have:

- The backend API on `http://localhost:4000`
- The Next.js frontend on `http://localhost:3000`
- A MongoDB instance seeded with 20 internships

If you cannot get the project running, email us — that itself is not a fail signal; we want to unblock you.

---

## Part 1 — Find and fix the bugs

When you explore the app, you will notice things that do not behave the way a user would expect. We have planted **about 5 bugs** across the frontend and the backend. Some are obvious, some are not.

**What we want you to do:**

- Find as many as you can.
- Fix each one with the **smallest reasonable change**. Do not refactor surrounding code unless you have a strong reason — and if you do, justify it in your README.
- For each bug you fix, jot down in your README:
  - A one-line description of the bug
  - The root cause
  - The fix you applied (one or two lines)
- If you suspect a bug but cannot reproduce or fix it, **say so** in your README. We value that more than silence.

**Where to look:** anywhere. The bugs are in both `frontend/` and `backend/`. Some only show up under specific user behaviour (try fast typing, try combining filters, try the apply flow under various conditions, try walking through every page).

---

## Part 2 — Feature: Save for later

Let a user bookmark internships they are interested in and view them on a dedicated page.

**Requirements:**

- A **bookmark button** on the internship detail page (and ideally also on each card in the catalog) that toggles the bookmarked state.
- A **`/saved` page** (placeholder already exists) that lists all of the current user's bookmarked internships.
- Bookmarks must **persist on the backend** in MongoDB. Do not store them only in localStorage.
- Use the existing `CURRENT_USER_ID` constant from `frontend/lib/api.js` as the user id. No auth needed.

**Backend:**

- Create a new Mongoose model and route(s) under `backend/`.
- Design the API however you think is right; you will be evaluated on whether it is sensible REST.

---

## Part 3 — Feature: Find your internship (AI-powered)

Build an AI-powered matching feature at the existing `/find` page.

**User flow:**

1. The user fills a short form with details about themselves. At minimum collect:
   - Field of study (free text)
   - Year of study (dropdown: 1st, 2nd, 3rd, 4th, postgraduate)
   - Skills (free text or tag input, your choice)
   - Interests or what they are looking for (short free text)
2. On submit, the backend uses a Large Language Model to recommend the **top 3 internships from the catalog** that match this user.
3. For each recommendation, show a **short one-line reason** explaining why it was recommended.

**Implementation guidance:**

- Use any LLM provider you like (OpenAI, Anthropic, Google Gemini, Mistral, etc.). All have free tiers more than sufficient for this assignment. Cost should be well under $1.
- The LLM **must only recommend internships from the catalog we have given you** — it must not invent internships. Think about how to enforce this.
- The LLM call lives in the backend, not the frontend. Your API key goes in `backend/.env` (never in the frontend).
- Design the response so the frontend can render it reliably. Think about what happens when the model returns malformed output, times out, or fails.
- Add a sensible loading state and error state in the UI.

We are not looking for a fancy ranking algorithm or fine-tuning. We are looking for clear, defensive integration of an LLM into a real product flow.

---

## What to submit

Please share **either**:

- A **GitHub repository** (preferred — public or invite us as collaborators), **or**
- A **zipped folder** sent via email

Include in your submission:

1. All of your code.
2. An updated `README.md` (you can append a `## Submission notes` section, or replace the existing README — your call) covering:
   - **Bugs:** list of bugs found, root causes, fixes.
   - **Features:** brief notes on how you built bookmarks and the AI matcher, including any tradeoffs.
   - **AI provider used** and a one-line note on how the candidate would handle cost/rate limits at scale (a sentence is fine).
   - **What you would improve** with more time.
   - **Setup changes**, if any (extra env vars, dependencies, etc.).
3. A short **screen recording (~3 minutes max, Loom or similar)** walking through:
   - The bugs you fixed (a quick demo of each, before/after)
   - The two new features in action
   - This is optional but strongly recommended.

---

## How we will evaluate

We are looking for, roughly in this order:

1. **Correctness** — bugs actually fixed, features actually work end-to-end.
2. **Code quality** — readable, consistent with the existing style, no obvious smells.
3. **Judgement** — minimal fixes vs over-refactoring, sensible API design, error handling.
4. **LLM integration** — structured output, guardrails, failure handling.
5. **Communication** — your README and the clarity of your reasoning.

We are **not** evaluating you on:

- Test coverage (writing a test or two for tricky logic is a nice bonus, not required).
- Visual design beyond what is already in the app.
- Production-grade auth or security (this is a stub user; do not build auth).
- Performance optimization.

---

## Ground rules

- **Use any tools you normally use** — AI assistants, Stack Overflow, docs, anything. We use them too. We will, however, ask you to walk through your code in a follow-up interview, so make sure you understand what you submitted.
- **No need to deploy** — local is fine.
- **Ask questions** if anything is ambiguous; we will reply within a working day.

Good luck. We are looking forward to seeing your work.
