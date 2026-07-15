# Find A Temp — Vercel App

A temp-staffing site: temps register with a CV, pay range, area, and 3 experience bullets;
companies browse by Dublin area/category and request a CV, interview, or trial. No CV is ever
publicly downloadable — every request goes to you by email for approval first.

## Stack
- **Next.js 14** (App Router) — SEO-friendly, deploys natively to Vercel
- **Vercel Postgres + Prisma** — database
- **Vercel Blob** — CV file storage
- **Resend** — sends you an email whenever someone requests a CV/interview/trial, or a new temp registers
- **Tailwind CSS** — styling

## 1. Push this to GitHub
Create a new repo and push this folder to it (Vercel deploys from GitHub).

## 2. Create the Vercel project
1. Go to vercel.com → **Add New → Project** → import your GitHub repo.
2. Before the first deploy, go to the project's **Storage** tab:
   - Add **Postgres** — this auto-populates `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`.
   - Add **Blob** — this auto-populates `BLOB_READ_WRITE_TOKEN`.
3. Go to **Settings → Environment Variables** and add the rest from `.env.example`:
   - `RESEND_API_KEY` — sign up free at resend.com, verify your `findatemp.ie` domain (or use their
     test domain to start), create an API key.
   - `RESEND_FROM_EMAIL` — e.g. `notifications@findatemp.ie` (must be on the verified domain)
   - `ADMIN_NOTIFICATION_EMAIL` — `gerard@findatemp.ie`
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — your choice, protects the `/admin` panel
4. Deploy.

## 3. Set up the database (one-time, after first deploy)
Locally, with the Vercel env vars pulled down (`vercel env pull .env`), run:
```
npm install
npx prisma db push      # creates the tables
npm run db:seed         # adds Dublin areas + starting categories
```

## 4. Point your domain
In Vercel project settings → **Domains**, add `findatemp.ie` and `www.findatemp.ie`, then update
your domain's DNS to point at Vercel (they'll show you the exact records).

## 5. When you're ready to load your existing dataset
Send it over in whatever format you have (spreadsheet/CSV/export) — I'll map it into
`prisma/data/temps-import.csv` in the format `prisma/import.ts` expects, and you run:
```
npm run db:import
```
This creates all the temp profiles at once. See the comments at the top of `prisma/import.ts`
for the exact column format if you want to prep the data yourself in the meantime.

## Local development
```
npm install
cp .env.example .env.local   # fill in values, or use `vercel env pull`
npx prisma generate
npm run dev
```

## How the request flow works (GDPR)
- Public temp profiles show only first name + last initial, area, category, pay range, driver
  status, and 3 experience bullets. No CV, no email, no phone.
- A company clicks **Request CV / Interview / Trial** → fills in their own details → this creates
  a `Request` row and emails you (`gerard@findatemp.ie`) with the requester's name, email, phone,
  company, and (for CV requests) a link to the file — with a reminder to check with the temp before
  sharing it.
- Nothing is ever auto-sent to the company. You control every handoff.

## Admin panel
Visit `/admin` (password-protected via `ADMIN_USERNAME`/`ADMIN_PASSWORD`) to:
- Approve or reject new temp registrations before they go live
- View all CV/interview/trial requests from companies

## Still to do before launch (not code)
- Verify your domain in Resend so emails send reliably
- Write a couple of sentences of unique intro copy for your top area pages if you want them to
  rank well (thin/duplicate content across near-identical area pages can hold back SEO)
- Set up Google Business Profile for local search visibility
- Decide on your CV retention/deletion policy for the privacy policy (currently a placeholder)
