# Internship Catalog — Take-Home Assignment

This is a full-stack internship catalog application built with Next.js, Node.js, Express, and MongoDB.

As part of the take-home assignment, I fixed the planted bugs, implemented backend-persisted saved internships, and added an AI-powered internship matcher using Google Gemini with a deterministic fallback matcher.

---

## Tech stack

* **Frontend:** Next.js 14 App Router, JavaScript, Tailwind CSS
* **Backend:** Node.js, Express
* **Database:** MongoDB with Mongoose
* **AI Provider:** Google Gemini API
* **Fallback Matcher:** Local deterministic scoring when Gemini is unavailable

---

## Prerequisites

* Node.js 18 or later
* npm
* MongoDB through one of the following:

  * Docker + Docker Compose
  * Local MongoDB running on `mongodb://localhost:27017`
  * MongoDB Atlas free tier

---

## Setup

### 1. Start MongoDB

If using Docker:

```bash
docker compose up -d
```

This starts MongoDB on `localhost:27017`.

If using MongoDB Atlas, skip this step and add your Atlas connection string in `backend/.env`.

---

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Backend runs at:

```bash
http://localhost:4000
```

Sanity check:

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/internships
```

Example `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/internship_catalog
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
```

`GEMINI_API_KEY` is optional for local demo because the matcher has a fallback mode, but Gemini recommendations work when the key is provided.

---

### 3. Frontend

In a new terminal:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend runs at:

```bash
http://localhost:3000
```

---

## Project structure

```txt
.
├── ASSIGNMENT.md
├── docker-compose.yml
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── seed.js
│   ├── data/internships.json
│   ├── models/
│   │   ├── Application.js
│   │   ├── Bookmark.js
│   │   └── Internship.js
│   └── routes/
│       ├── applications.js
│       ├── bookmarks.js
│       ├── internships.js
│       └── match.js
└── frontend/
    ├── app/
    │   ├── layout.js
    │   ├── page.js
    │   ├── saved/page.js
    │   ├── find/page.js
    │   ├── internships/[id]/page.js
    │   └── components/
    └── lib/api.js
```

---

# Submission notes

## Bugs fixed

---

## Bug 1: Pagination skipped records incorrectly

### Before behavior

The catalog had 20 internships and a page size of 9.

Expected pagination:

```txt
Page 1: 9 internships
Page 2: 9 internships
Page 3: 2 internships
```

Actual behavior before fix:

```txt
Page 1: 9 internships
Page 2: 2 internships
Page 3: 0 internships
```

The UI still showed `Page 1 of 3`, but the records on page 2 and page 3 were incorrect.

### Root cause

The backend calculated MongoDB skip incorrectly.

```js
const skip = pageNum * limitNum;
```

For page 2, this skipped `2 * 9 = 18` records, so it only returned the last 2 internships. For page 3, it skipped 27 records even though only 20 existed.

### Fix

Changed skip calculation to use zero-based offset logic.

```js
const skip = (pageNum - 1) * limitNum;
```

### Why this works

```txt
Page 1: (1 - 1) * 9 = 0
Page 2: (2 - 1) * 9 = 9
Page 3: (3 - 1) * 9 = 18
```

### Corrected behavior

Pagination now shows:

```txt
Page 1: 9 internships
Page 2: 9 internships
Page 3: 2 internships
```

---

## Bug 2: Combined filters returned incorrect results

### Before behavior

When selecting multiple filters such as:

```txt
Domain = Software
Work mode = Remote
Location = Bangalore
```

the API returned internships that matched **any one** of these filters. For example, it returned Software internships that were not Remote, Remote internships from other domains, and Bangalore internships from unrelated domains.

### Root cause

The backend combined filter clauses using `$or`.

```js
const filter = clauses.length ? { $or: clauses } : {};
```

This meant internships only needed to match one selected condition.

### Fix

Changed the filter combination to `$and`.

```js
const filter = clauses.length ? { $and: clauses } : {};
```

### Why this works

When users select multiple filters, the expected behavior is that results must satisfy all selected conditions together.

### Corrected behavior

Now:

```txt
Software + Remote
```

returns only internships that are both Software and Remote.

And:

```txt
Software + Remote + Bangalore
```

correctly returns 0 results if no internship matches all three conditions.

---

## Bug 3: Search crashed for special regex characters

### Before behavior

Typing special characters like these in the search box crashed the page or caused the backend to return 500:

```txt
*
[
(
+
?
```

Example failing API:

```txt
GET /api/internships?q=*&page=1&limit=9
```

Response before fix:

```json
{
  "error": "Failed to fetch internships"
}
```

The frontend then crashed because it expected `data.items`, but the error response did not contain `items`.

### Root cause

The backend created a regular expression directly from user input.

```js
const rx = new RegExp(q.trim(), 'i');
```

Characters like `*` and `[` are special regex characters. If passed directly, they can create invalid regex syntax.

### Fix

Added an escaping helper before creating the regex.

```js
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

Then used it while creating the search regex:

```js
const rx = new RegExp(escapeRegex(q.trim()), 'i');
```

### Why this works

Special regex characters are now treated as normal searchable text instead of regex syntax.

### Corrected behavior

Searching for:

```txt
*
[
{}
```

now safely returns 0 results instead of crashing.

Normal searches like:

```txt
cloud
React
Marketing
```

continue to work.

---

## Bug 4: Clear all did not clear min stipend input

### Before behavior

When the user entered a value in Min stipend and clicked **Clear all**, checkbox filters were cleared, but the Min stipend input still displayed the old value.

Example:

```txt
Min stipend = 400
Click Clear all
```

The results reset, but the input still showed `400`.

### Root cause

The `clearAll` function reset only checkbox filters.

```js
const clearAll = () => {
  onChange({
    ...filters,
    domain: [],
    workMode: [],
    location: [],
  });
};
```

It did not reset `minStipend`.

### Fix

Added `minStipend: ''` to the clear state.

```js
const clearAll = () => {
  onChange({
    ...filters,
    domain: [],
    workMode: [],
    location: [],
    minStipend: '',
  });
};
```

### Why this works

The Min stipend input is controlled by `filters.minStipend`. Setting it to an empty string clears the visible input and removes the filter from the next API request.

### Corrected behavior

Clicking **Clear all** now clears:

```txt
Domain filters
Work mode filters
Location filters
Min stipend input
```

and resets the catalog back to all internships.

---

## Bug 5: Apply button showed success even when the request failed

### Before behavior

The Apply button showed:

```txt
Application submitted!
```

even when the backend returned an error such as duplicate application.

For example, applying to the same internship again returned `409 Conflict` from the backend, but the frontend still showed success.

### Root cause

The frontend used `fetch()` but did not check `res.ok`.

```js
await fetch(`${API_BASE}/api/applications`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    internshipId,
    userId: CURRENT_USER_ID,
  }),
});

setStatus('success');
```

`fetch()` does not throw for HTTP errors like `400`, `409`, or `500`. It only throws for network-level failures.

The catch block also incorrectly set success.

```js
catch (err) {
  setStatus('success');
}
```

### Fix

Added proper response handling, message state, and error state.

```js
const res = await fetch(`${API_BASE}/api/applications`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    internshipId,
    userId: CURRENT_USER_ID,
  }),
});

const data = await res.json();

if (!res.ok) {
  setStatus('error');
  setMessage(data.error || 'Could not submit application. Please try again.');
  return;
}

setStatus('success');
setMessage('Application submitted!');
```

The catch block now shows a real error instead of false success.

```js
catch (err) {
  setStatus('error');
  setMessage('Could not submit application. Please check your connection and try again.');
}
```

### Why this works

`res.ok` is true only for successful HTTP responses. Duplicate applications return `409`, so the UI now shows the backend error message instead of incorrectly showing success.

### Corrected behavior

First successful apply:

```txt
Applied ✓
Application submitted!
```

Duplicate apply:

```txt
You have already applied to this internship
```

Network/server failure:

```txt
Could not submit application. Please check your connection and try again.
```

---

# Features implemented

---

## Feature 1: Save for later

Implemented backend-persisted bookmarking for internships.

### What was added

Users can now:

```txt
Save internships from the catalog page
Save internships from the internship detail page
View saved internships on /saved
Unsave internships
Refresh the page and still see saved state
```

Bookmarks are stored in MongoDB, not localStorage.

### Backend implementation

Created a new Mongoose model:

```js
const bookmarkSchema = new mongoose.Schema(
  {
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, internshipId: 1 }, { unique: true });
```

The unique compound index prevents duplicate bookmarks for the same user and internship.

### Backend routes

Added `/api/bookmarks`.

Main behavior:

```txt
GET    /api/bookmarks?userId=demo-user
GET    /api/bookmarks/:internshipId?userId=demo-user
POST   /api/bookmarks
DELETE /api/bookmarks/:internshipId?userId=demo-user
```

### Frontend implementation

Added a reusable `BookmarkButton` component and used it in:

```txt
Catalog internship cards
Internship detail page
Saved internships page
```

The saved page now lists all saved internships for the current user.

### Why this approach

The assignment required persistence on the backend, so bookmarks are stored in MongoDB using the existing `CURRENT_USER_ID` constant instead of localStorage.

### Tradeoff

Each visible card checks saved state independently. This is simple and safe for a small assignment. In a production app, I would batch saved states into the catalog API response or add a bulk lookup endpoint to reduce request count.

---

## Feature 2: Find your internship AI matcher

Implemented the AI-powered matcher on `/find`.

### User flow

The user fills a short form:

```txt
Field of study
Year of study
Skills
Interests / what they are looking for
```

The backend recommends the top 3 internships from the existing catalog and returns one-line reasons.

### Backend implementation

Added:

```txt
POST /api/match
```

Request body:

```json
{
  "fieldOfStudy": "Data Science",
  "yearOfStudy": "postgraduate",
  "skills": "Python, SQL, Pandas",
  "interests": "analytics, dashboards, machine learning"
}
```

Response shape:

```json
{
  "recommendations": [
    {
      "internship": {
        "_id": "existing_catalog_id",
        "title": "Data Science Intern"
      },
      "reason": "Perfect match for your Python, SQL, and Pandas skills."
    }
  ],
  "provider": "gemini",
  "warning": null
}
```

### Gemini integration

The backend fetches all internships from MongoDB, builds a compact catalog, and sends that catalog to Gemini.

The Gemini prompt asks for strict JSON only:

```json
{
  "recommendations": [
    {
      "internshipId": "existing_mongo_id",
      "reason": "one-line reason"
    }
  ]
}
```

### Catalog-only guardrail

Gemini is not allowed to invent internships because the backend validates every returned ID.

The backend:

```txt
Fetches actual internships from MongoDB
Builds an allowed ID map
Sends only compact catalog data to Gemini
Accepts only returned IDs that exist in the allowed map
Discards invalid or duplicate IDs
Never sends raw Gemini output directly to the frontend
```

### Fallback matcher

If Gemini is unavailable, missing, rate-limited, times out, or returns malformed output, the app uses a deterministic fallback matcher.

Fallback behavior:

```txt
Scores internships based on overlap with field of study, skills, interests, title, domain, skills, and description
Returns top 3 actual catalog internships
Generates simple one-line reasons
Does not invent internships
```

Fallback response example:

```json
{
  "provider": "fallback",
  "warning": "AI matching is unavailable, so fallback matching was used."
}
```

### Frontend implementation

The `/find` page now includes:

```txt
Form inputs
Loading state
Error state
Recommendation cards
One-line reasons
Links to internship detail pages
Provider/fallback indication
```

### AI provider used

Google Gemini API is used from the backend only.

The key is stored in:

```txt
backend/.env
```

and the placeholder is documented in:

```txt
backend/.env.example
```

The key is never exposed to the frontend.

### Cost/rate limit note

At scale, I would add request throttling, caching for repeated profiles, model timeout controls, fallback ranking, and monitoring for token usage/rate-limit errors.

---

# Manual verification

## Bug verification

Tested:

```txt
Pagination: 9 + 9 + 2 records
Combined filters: Software + Remote returns only matching internships
Search special characters: *, [, {} no longer crash
Clear all: resets checkbox filters and min stipend
Apply flow: duplicate applications show proper error
```

## Feature verification

Tested:

```txt
Save from catalog
Saved state persists after refresh
Saved state appears on detail page
Saved internships appear on /saved
Unsave removes item
Find matcher returns 3 recommendations
Gemini path works with provider: "gemini"
Fallback path works with provider: "fallback"
Recommendation links open valid internship detail pages
```

## Regression checks

Rechecked:

```txt
Browse page
Search
Filters
Pagination
Internship detail page
Apply flow
Save for later
Saved internships page
Find your internship page
```

---

# What I would improve with more time

* Add automated tests for pagination, filters, search escaping, and apply flow.
* Add bulk saved-state lookup to reduce one request per card.
* Improve the AI matcher with stronger scoring and better reason templates.
* Add server-side rate limiting for `/api/match`.
* Add retry/backoff and better observability for Gemini failures.
* Add auth instead of using a fixed `CURRENT_USER_ID`.
* Add loading skeletons and toast notifications for better UX.
* Add indexes for common internship filters if the dataset grows.

---

## Submission

This repository contains:

```txt
All source code
Bug fixes
Save for later feature
AI-powered matcher feature
Updated README submission notes
```
