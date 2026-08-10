# Brandon's Care

A rebuilt version of the Brandon's Care dashboard: Vite (vanilla JS) frontend
on Netlify, Postgres backend on Supabase, real login instead of a public
WordPress page.

## 1. Create the Supabase project

1. Go to https://supabase.com, create a free project.
2. In the SQL Editor, run everything in `supabase-schema.sql` — this creates
   the `entries` table and locks it down so only the signed-in caregiver can
   read/write their own rows.
3. In **Project Settings -> API**, copy the **Project URL** and **anon public
   key**.
4. In **Authentication -> Providers**, make sure Email is enabled. For a
   single-caregiver app you can turn off "Confirm email" under
   **Authentication -> Settings** so sign-up works instantly without an
   email step (or leave it on for extra security).

## 2. Configure the app locally

```bash
cp .env.example .env
# paste your Supabase URL + anon key into .env
npm install
npm run dev
```

Open the local URL, click "Sign up" once to create your caregiver login,
then use "Sign in" from then on.

## 3. Deploy to Netlify

Easiest path — connect this project's git repo to Netlify (or drag-and-drop
the `dist` folder after `npm run build`), then in **Site settings ->
Environment variables** add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Netlify will run `npm run build` and publish `dist/` automatically
(`netlify.toml` is already set up, including the redirect rule the
hash-router needs).

## What's wired up vs. what's a placeholder

**Fully working, backed by Supabase:**
Today's Schedule, Daily Checklist Form, Weekend Daily Checklist, Caretaker
Daily Summary, Daily Mood Check, Caregiver Notes/Logs, Medication,
Therapy, Supplies & Inventory, Supplies Order List, Calendar &
Appointments, plus a combined History view and a dashboard "today's
rhythm" strip.

**Placeholder content (structure is built, text needs to be filled in)**
in `src/config.js` -> `STATIC_CONTENT`: About, PEG Feeding Guide, PEG Tube
Care, Check Gastric Residual Volume, Incontinence & Skin Care. These were
left blank on purpose rather than guessed, since it's care-instruction
content — paste in your real guides from the current site.

## Adding a second caregiver

Right now every row is private to the account that created it (`user_id`
via Row Level Security). If you want a second caregiver to see the same
data, the cleanest change is to add a `household_id` column and switch the
RLS policies in `supabase-schema.sql` to check that instead of `user_id` —
happy to help with that when you're ready.
