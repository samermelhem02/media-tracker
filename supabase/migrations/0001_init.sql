-- Trackify / Media Tracker - Initial Supabase schema
-- This migration creates:
-- - public.profiles
-- - public.media_items
-- - enum types: media_type, media_status
-- - indexes
-- - Row Level Security (RLS) + policies

-- ==============================
-- EXTENSIONS
-- ==============================
create extension if not exists "pgcrypto";

-- ==============================
-- ENUM TYPES
-- ==============================
do $$ begin
  create type public.media_type as enum ('movie','series','book','game','music');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.media_status as enum ('owned','wishlist','watching','completed');
exception when duplicate_object then null;
end $$;

-- ==============================
-- PROFILES TABLE
-- ==============================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  first_name text,
  last_name text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================
-- MEDIA ITEMS TABLE
-- ==============================
create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  creator text,
  description text,
  release_date date,
  media_type public.media_type not null,
  status public.media_status not null default 'wishlist',
  rating int check (rating >= 1 and rating <= 10),
  review text,
  genre text,
  tags text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_media_items_user_id on public.media_items(user_id);
create index if not exists idx_media_items_title on public.media_items(title);

-- ==============================
-- ROW LEVEL SECURITY
-- ==============================
alter table public.profiles enable row level security;
alter table public.media_items enable row level security;

-- ==============================
-- PROFILES POLICIES
-- ==============================
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles
for select
using (
  is_public = true
  or auth.uid() = id
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id);

-- ==============================
-- MEDIA ITEMS POLICIES
-- ==============================
drop policy if exists "media_items_select_owner_or_public" on public.media_items;
create policy "media_items_select_owner_or_public"
on public.media_items
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.profiles p
    where p.id = media_items.user_id
      and p.is_public = true
  )
);

drop policy if exists "media_items_insert_own" on public.media_items;
create policy "media_items_insert_own"
on public.media_items
for insert
with check (auth.uid() = user_id);

drop policy if exists "media_items_update_own" on public.media_items;
create policy "media_items_update_own"
on public.media_items
for update
using (auth.uid() = user_id);

drop policy if exists "media_items_delete_own" on public.media_items;
create policy "media_items_delete_own"
on public.media_items
for delete
using (auth.uid() = user_id);
