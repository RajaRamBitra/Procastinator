# Procastinator

Procastinator is a lightweight productivity dashboard built with **React + Vite**. It helps you stay focused with one main task, a Pomodoro timer, visual progress tracking, and reminder notifications.

## Features

- Main task editor with local state and optional Supabase sync
- Pomodoro timer with:
  - Focus mode (default **25:00**)
  - Short break mode (default **05:00**)
  - Start, pause, and reset controls
- Progress bars for:
  - Current session completion
  - Daily completion (simple local metric)
- Reminder notifications:
  - Browser notifications when available
  - In-app toast fallback when notifications are denied/unavailable
- Netlify-ready configuration with SPA fallback

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Fill in Supabase values in `.env` (optional but recommended).

4. Start the app:

   ```bash
   npm run dev
   ```

5. Build for production:

   ```bash
   npm run build
   ```

## Supabase setup (free tier friendly)

1. Create a Supabase project from https://supabase.com.
2. In project settings, copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`
3. Add these values to your `.env` file.
4. Run this SQL in the Supabase SQL editor:

```sql
create extension if not exists pgcrypto;

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  completed boolean not null default false,
  is_main boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete set null,
  mode text not null,
  duration_minutes int not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
```

> The app still runs without env vars. In that mode, it uses local state and displays guidance for enabling Supabase.

## Deploy to Netlify

1. Push your repository to GitHub.
2. In Netlify, create a new site from this repository.
3. Netlify will use `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - SPA redirect: `/* -> /index.html`
4. Set environment variables in Netlify site settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Trigger deploy.

## Scripts

- `npm run dev` – Start local dev server
- `npm run build` – Build production bundle
- `npm run preview` – Preview production build locally
- `npm run lint` – Run ESLint
