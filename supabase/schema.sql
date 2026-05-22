-- Shotbase database schema
-- Run in Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to re-run: every statement uses IF NOT EXISTS.

create extension if not exists "uuid-ossp";

-- ─── users ────────────────────────────────────────────────────────────
-- Written by: Clerk webhook (user.created), Stripe webhook (checkout/sub events),
--             billing checkout (when first stripe_customer_id is created)
-- Read by:    keys/create (plan lookup), billing/checkout, billing/portal, usage
create table if not exists public.users (
  id                      uuid primary key default uuid_generate_v4(),
  clerk_id                text unique not null,
  email                   text,
  plan                    text default 'free',
  stripe_customer_id      text,
  stripe_subscription_id  text,
  created_at              timestamptz default now()
);

create index if not exists users_clerk_id_idx           on public.users(clerk_id);
create index if not exists users_stripe_customer_id_idx on public.users(stripe_customer_id);

-- ─── screenshots ──────────────────────────────────────────────────────
-- Written by: Railway backend (logScreenshot in server.ts) after each request
-- Read by:    /api/usage (count per month), /api/logs (recent 50)
create table if not exists public.screenshots (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,
  url         text,
  format      text,
  status      int,
  time_ms     int,
  size_kb     int,
  cached      boolean,
  created_at  timestamptz default now()
);

create index if not exists screenshots_user_id_created_at_idx
  on public.screenshots(user_id, created_at desc);

-- ─── Row-Level Security ───────────────────────────────────────────────
-- Service-role key (used server-side by the frontend + Railway backend) bypasses RLS,
-- so enabling RLS with no policies just blocks the anon/public role.
alter table public.users       enable row level security;
alter table public.screenshots enable row level security;
