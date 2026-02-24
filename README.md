# Trackify (Media Tracker)

Trackify is a simple media tracker to save items (movies / series / music / books / games), mark status (owned / wishlist / watching / completed), rate, review, and search your collection.  
It uses **Supabase** (Auth + DB), **TMDB** for metadata, and an optional **OpenAI** demo mode.

---

## Requirements

- Node.js 18+ (recommended)
- pnpm

---

## Run locally

### Install

```bash
pnpm install
```

### Create `.env.local`

Create a file named `.env.local` in the project root (**do not commit this file**):

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

TMDB_API_KEY=YOUR_TMDB_API_KEY

# Optional (AI)
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
AI_MODE=demo
```

### Start the app

```bash
pnpm dev
```

Open: http://localhost:3000

---

## Supabase setup

### Create a Supabase project

1. Create a new Supabase project in the [Supabase dashboard](https://supabase.com/dashboard).
2. In your Supabase project, go to **SQL Editor**.

### Run the migration SQL

In the Supabase **SQL Editor**, run these in order:

1. **`supabase/migrations/0001_init.sql`** — creates:
   - `public.profiles`
   - `public.media_items`
   - enum types (`media_type`, `media_status`)
   - indexes
   - RLS + policies (private-by-default with optional public sharing)

2. **`supabase/migrations/0002_storage_media_posters.sql`** — creates:
   - Storage bucket **`media-posters`** (private, 5MB limit, images only)
   - RLS policies so users can upload/read/update/delete their own posters, and everyone can read posters for public profiles

Paste each file’s contents into a new query and run it (or use the Supabase CLI).

### Auth

Enable **Email** (and optionally **Password**) in **Authentication → Providers**.

---

## Notes

- Never commit real secrets (especially `OPENAI_API_KEY`) to Git.
- `NEXT_PUBLIC_SUPABASE_*` values are safe to be public, but keep them in `.env.local` for local development.

---

## Deploy on Vercel

1. **Push your code to GitHub** (if you haven’t already).

2. **Import the project on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in (GitHub recommended).
   - Click **Add New… → Project** and import your `media-tracker` repo.
   - Vercel will detect Next.js; leave **Build Command** as `next build` and **Output Directory** as default.

3. **Add environment variables**
   - In the project → **Settings → Environment Variables**, add:

   | Name | Notes |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase project → Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase (anon/public key) |
   | `TMDB_API_KEY` | From [themoviedb.org](https://www.themoviedb.org/settings/api) |
   | `OPENAI_API_KEY` | From OpenAI (for AI recommendations) |
   | `AI_MODE` | `demo` (no OpenAI) or `live` (AI recommendations) |

   Add them for **Production** (and optionally Preview if you want them in PR previews).

4. **Deploy**
   - Click **Deploy**. Vercel will run `pnpm build` (or npm/yarn based on lockfile) and deploy.
   - After the first deploy, every push to your main branch will trigger a new production deployment.

**Deploy from the CLI (from project root)**

```bash
npx vercel login
pnpm run deploy
# or: npx vercel --yes
```

After the first deploy, add the environment variables in the Vercel dashboard (**Project → Settings → Environment Variables**) or with `vercel env add <name>`.
