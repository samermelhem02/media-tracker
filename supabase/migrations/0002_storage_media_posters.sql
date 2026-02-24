-- Trackify: Storage bucket and policies for poster images
-- Run this after 0001_init.sql (e.g. in Supabase SQL Editor).
-- Creates bucket "media-posters" (private) and RLS so users can upload/read
-- in their own folder (path: {user_id}/{filename}) and read public profiles' posters.

-- ==============================
-- BUCKET
-- ==============================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media-posters',
  'media-posters',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ==============================
-- STORAGE POLICIES (storage.objects)
-- Path format: {user_id}/{uuid}-{filename}
-- ==============================

-- Allow authenticated users to upload only into their own folder
drop policy if exists "media_posters_insert_own" on storage.objects;
create policy "media_posters_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'media-posters'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
drop policy if exists "media_posters_select_own" on storage.objects;
create policy "media_posters_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'media-posters'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read files in folders owned by users with public profiles
drop policy if exists "media_posters_select_public_profiles" on storage.objects;
create policy "media_posters_select_public_profiles"
on storage.objects for select
to authenticated
using (
  bucket_id = 'media-posters'
  and exists (
    select 1 from public.profiles p
    where p.id::text = (storage.foldername(name))[1]
      and p.is_public = true
  )
);

-- Allow anon (e.g. signed-out visitors) to read posters for public profiles
drop policy if exists "media_posters_select_public_profiles_anon" on storage.objects;
create policy "media_posters_select_public_profiles_anon"
on storage.objects for select
to anon
using (
  bucket_id = 'media-posters'
  and exists (
    select 1 from public.profiles p
    where p.id::text = (storage.foldername(name))[1]
      and p.is_public = true
  )
);

-- Allow overwrite (upsert) in own folder
drop policy if exists "media_posters_update_own" on storage.objects;
create policy "media_posters_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'media-posters'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow delete in own folder
drop policy if exists "media_posters_delete_own" on storage.objects;
create policy "media_posters_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'media-posters'
  and (storage.foldername(name))[1] = auth.uid()::text
);
