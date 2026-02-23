This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Deploy Media Tracker to Vercel

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
# 1. Log in to Vercel (opens browser or prints a link)
npx vercel login

# 2. Deploy (first time will link the project)
pnpm run deploy
# or: npx vercel --yes
```

After the first deploy, add the environment variables in the Vercel dashboard (**Project → Settings → Environment Variables**) or with `vercel env add <name>`.
