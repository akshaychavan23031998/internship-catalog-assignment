# Internship Catalog — Take-Home Assignment

Hi! This is a small full-stack application that you will improve as part of the take-home assignment. Please read **ASSIGNMENT.md** for what you are expected to do. This file only covers setup.

---

## Tech stack

- **Frontend:** Next.js 14 (App Router, JavaScript) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)

---

## Prerequisites

- Node.js 18 or later
- npm
- One of the following for MongoDB:
  - **Docker + Docker Compose** (easiest — included `docker-compose.yml` does the work)
  - **Local MongoDB** running on `mongodb://localhost:27017`
  - **MongoDB Atlas** free tier (just paste your connection string into `backend/.env`)

---

## Setup

### 1. Start MongoDB

If you have Docker:

```bash
docker compose up -d
```

This starts MongoDB on `localhost:27017` and persists data in a Docker volume.

If you prefer your own MongoDB or Atlas, skip this step — just make sure `MONGODB_URI` in `backend/.env` points to it.

### 2. Backend

```bash
cd backend
cp .env.example .env        # adjust MONGODB_URI if needed
npm install
npm run seed                # inserts 20 sample internships
npm run dev                 # starts API at http://localhost:4000
```

You can sanity check with:

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/internships
```

### 3. Frontend

In a new terminal:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # starts app at http://localhost:3000
```

Open http://localhost:3000.

---

## Project structure

```
.
├── ASSIGNMENT.md           ← read this for the task
├── docker-compose.yml      ← MongoDB for local dev
├── backend/                ← Express + Mongoose API
│   ├── server.js
│   ├── db.js
│   ├── seed.js
│   ├── data/internships.json
│   ├── models/
│   └── routes/
└── frontend/               ← Next.js App Router
    ├── app/
    │   ├── layout.js
    │   ├── page.js                  ← listing page
    │   ├── internships/[id]/page.js ← detail page
    │   ├── saved/page.js            ← placeholder, build this
    │   ├── find/page.js             ← placeholder, build this
    │   └── components/
    └── lib/api.js
```

---

## Submission

See ASSIGNMENT.md for what to submit.

Good luck — have fun with it!
