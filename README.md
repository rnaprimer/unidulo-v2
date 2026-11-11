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

## Where things are

| Path | What it is |
| --- | --- |
| `src/app/` | Pages. Each folder is a URL. |
| `src/app/actions.ts` | The two server functions the forms call. |
| `src/lib/schemas.ts` | Validation rules, shared by browser and server. |
| `src/lib/server/submit.ts` | Bot checks, rate limit, database save, email. |
| `src/components/` | Form building blocks and the box drawing. |
| `supabase/migrations/` | Database tables and access rules. |
| `CLAUDE.md` | Scope and rules for AI-assisted work on this repo. |

## Reading submissions

There is no dashboard yet. Open the `rfqs` and `manufacturer_applications`
tables in the Supabase Table Editor. A row with an empty `notified_at` means
the alert email did not go out.
