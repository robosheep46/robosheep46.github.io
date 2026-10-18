create extension if not exists pgcrypto;

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('moment', 'weekly')),
  slug text not null,
  title text not null default '',
  body text not null default '',
  sections jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
  happened_at timestamptz not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);

create index if not exists posts_public_timeline_idx
  on public.posts (kind, status, happened_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
before update on public.posts
for each row execute function public.touch_updated_at();

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.site_admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to anon, authenticated;

alter table public.site_admins enable row level security;
alter table public.posts enable row level security;

drop policy if exists "Public reads published posts" on public.posts;
create policy "Public reads published posts"
on public.posts for select
to anon, authenticated
using (status = 'published' or public.is_site_admin());

drop policy if exists "Admins create posts" on public.posts;
create policy "Admins create posts"
on public.posts for insert
to authenticated
with check (public.is_site_admin());

drop policy if exists "Admins update posts" on public.posts;
create policy "Admins update posts"
on public.posts for update
to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());

drop policy if exists "Admins delete posts" on public.posts;
create policy "Admins delete posts"
on public.posts for delete
to authenticated
using (public.is_site_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-media',
  'content-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads content media" on storage.objects;
create policy "Public reads content media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'content-media');

drop policy if exists "Admins upload content media" on storage.objects;
create policy "Admins upload content media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'content-media' and public.is_site_admin());

drop policy if exists "Admins update content media" on storage.objects;
create policy "Admins update content media"
on storage.objects for update
to authenticated
using (bucket_id = 'content-media' and public.is_site_admin())
with check (bucket_id = 'content-media' and public.is_site_admin());

drop policy if exists "Admins delete content media" on storage.objects;
create policy "Admins delete content media"
on storage.objects for delete
to authenticated
using (bucket_id = 'content-media' and public.is_site_admin());
