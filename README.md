# Ginger Pop — Enterprise Learning Platform

Monorepo with separate **frontend** (Next.js) and **backend** (Express API).

## Project structure

```
Quiz/
├── frontend/          # Next.js UI (pages, components, styles)
│   └── src/
│       ├── app/       # Routes (no API — proxied to backend)
│       ├── components/
│       ├── lib/       # Client utilities (cn, course-rules)
│       └── types/
├── backend/           # Express REST API
│   └── src/
│       ├── routes/    # /api/* handlers
│       ├── models/    # MongoDB (Mongoose)
│       ├── lib/       # Auth, email, Cloudinary, etc.
│       └── types/
├── .env               # Shared environment (root)
└── package.json       # Workspace scripts
```

## Setup

```bash
npm install
cp .env.example .env   # configure MONGODB_URI, JWT_SECRET, Cloudinary, SMTP
npm run seed:admin       # seeds super admin + admin accounts
npm run dev              # starts backend (:4000) + frontend (:3000)
```

The frontend proxies `/api/*` to the backend, so existing `fetch("/api/...")` calls work unchanged.

### Seed accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@quiz.com` | `superadmin123` |
| Admin | `admin@quiz.com` | `admin123` |

Sign out and back in after seeding so your session reflects the correct role.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Backend + frontend (concurrent) |
| `npm run dev:frontend` | Next.js only |
| `npm run dev:backend` | Express API only |
| `npm run build` | Build both packages |
| `npm run seed:admin` | Seed admin accounts |

## Workflows

### Super Admin

1. Sign in at `/admin/login`
2. Navigate to **Administrators** in the sidebar
3. Create admin accounts for course authors

### Admin

1. **Courses** → create a new course
2. **Quiz-only** — add assessment questions without lessons, publish, and invite
3. **With lessons** — add Lesson 1, then add at least one assessment for it before adding Lesson 2; repeat for each lesson
4. Mark **Published** and save
5. **Learners** — invite by email; recipients receive a `/learn/[token]` link

### Learner

1. Opens invite link from email
2. **Quiz-only** — goes directly to the assessment
3. **With lessons** — completes each lesson, takes that lesson's assessment, then proceeds to the next
4. Reviews final score when all content is complete

## Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing home |
| `/play` | Demo assessment |
| `/admin/login` | Admin sign in |
| `/admin/dashboard` | Course management |
| `/admin/super/admins` | Administrator provisioning (super admin only) |
| `/admin/courses/[id]` | Course editor |
| `/learn/[token]` | Learner experience |

## Tech stack

- **Frontend:** Next.js 15 · React 19 · Tailwind CSS 4
- **Backend:** Express · MongoDB · JWT · Cloudinary · Nodemailer

## Media uploads (audio / video / image)

Course lessons and assessment questions support **WhatsApp-style recording** in the admin editor:

1. Choose a lesson or question type: **audio**, **video**, or **image**
2. **Tap to record** (mic or camera) → preview → **Upload to Cloudinary**
3. Or pick an existing file from your device

Configure Cloudinary in `.env`:

```bash
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

Restart dev servers after changing `.env`.
