# Unidulo v2

Website for Unidulo: custom packaging manufacturing, managed. This version has
the marketing pages, a packaging quote-request form and a manufacturer
application form. Submissions are saved to Supabase and the owner gets an email.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Setting up the services

1. **Supabase**: create a new project. Open SQL Editor, paste the contents of
   `supabase/migrations/0001_init.sql`, and run it once. Copy the project URL
   and the service-role key from Project Settings > API.
2. **Cloudflare Turnstile**: add a widget for your domain and copy the site key
   and secret key.
3. **Resend**: verify your sending domain, create an API key.
4. **Vercel**: import this repository and add every variable from
   `.env.example` under Settings > Environment Variables, then redeploy.

Until Supabase is configured the forms refuse submissions with an error. In
production they also refuse if the Turnstile secret key is missing.

## The owner's console (`/ops`)

A private page for reading and following up submissions. Only one person can
sign in: a Supabase Auth user created by hand, whose id is set as
`OWNER_USER_ID`. There is no sign-up page.

To set it up:

1. Run `supabase/migrations/0002_ops_console.sql` once in the Supabase SQL
   Editor (after `0001_init.sql`).
2. In Supabase, open Authentication > Users > Add user > Create new user. Enter
   your email and a strong password and tick Auto Confirm User.
3. Copy that user's User UID into `OWNER_USER_ID` in `.env.local` and in Vercel.
4. In Supabase, open Authentication > Sign In / Providers and turn off
   "Allow new users to sign up".

A session lasts as long as Supabase's JWT expiry setting (one hour by default).
After that the console sends you back to the login page.

## Where things are

| Path | What it is |
| --- | --- |
| `src/app/` | Pages. Each folder is a URL. |
| `src/app/actions.ts` | The two server functions the forms call. |
| `src/app/ops/` | The owner's console: login, list, record page, its server functions. |
| `src/lib/schemas.ts` | Validation rules, shared by browser and server. |
| `src/lib/server/submit.ts` | Bot checks, rate limit, database save, email. |
| `src/lib/server/ops.ts` | Who may use the console, and the database reads it needs. |
| `src/lib/records.ts` | Rules shared by the console: statuses, overdue, paging, the alert email. |
| `src/components/` | Form building blocks and the box drawing. |
| `supabase/migrations/` | Database tables and access rules. |
| `CLAUDE.md` | Scope and rules for AI-assisted work on this repo. |

## Reading submissions

Sign in at `/ops`. Each record shows the original submission, and lets you set
a status, a next action with a due date, and private notes. A record marked
"Alert not sent" has an empty `notified_at`: open it and press "Resend alert
email". The same rows are also visible in the Supabase Table Editor.
