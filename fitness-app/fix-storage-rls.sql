-- Fix storage RLS policies for Thumbnails bucket
-- Run this in Supabase SQL Editor

-- First, drop any existing policies on storage.objects for Thumbnails
drop policy if exists "public read thumbnails" on storage.objects;
drop policy if exists "allow upload thumbnails" on storage.objects;
drop policy if exists "allow anonymous upload thumbnails" on storage.objects;
drop policy if exists "allow anonymous update thumbnails" on storage.objects;
drop policy if exists "public upload thumbnails" on storage.objects;

-- Option 1: Disable RLS entirely on storage.objects (simplest for personal app)
-- Uncomment the line below if you want to disable RLS completely
-- alter table storage.objects disable row level security;

-- Option 2: Create permissive policies (recommended)
-- Allow anyone to read from Thumbnails bucket
create policy "public read thumbnails"
on storage.objects for select
using (bucket_id = 'Thumbnails');

-- Allow anyone to insert into Thumbnails bucket
create policy "public insert thumbnails"
on storage.objects for insert
with check (bucket_id = 'Thumbnails');

-- Allow anyone to update files in Thumbnails bucket (for upsert)
create policy "public update thumbnails"
on storage.objects for update
using (bucket_id = 'Thumbnails');

-- Allow anyone to delete from Thumbnails bucket
create policy "public delete thumbnails"
on storage.objects for delete
using (bucket_id = 'Thumbnails');
