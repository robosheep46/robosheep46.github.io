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

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  target_kind text not null check (target_kind in ('life_image', 'robomaster_node', 'page')),
  target_key text not null check (target_key ~ '^[a-z0-9][a-z0-9._-]{0,79}$'),
  nickname text not null check (char_length(btrim(nickname)) between 1 and 20),
  body text not null check (char_length(btrim(body)) between 1 and 500),
  parent_id uuid references public.comments(id) on delete cascade,
  visitor_token uuid not null,
  created_at timestamptz not null default now()
);

create or replace view public.public_comments as
select id, target_kind, target_key, nickname, body, parent_id, created_at
from public.comments;

create index if not exists posts_public_timeline_idx
  on public.posts (kind, status, happened_at desc);

create index if not exists comments_target_timeline_idx
  on public.comments (target_kind, target_key, created_at asc);

create index if not exists comments_parent_idx
  on public.comments (parent_id)
  where parent_id is not null;

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

create or replace function public.validate_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parent_comment public.comments%rowtype;
begin
  new.id = gen_random_uuid();
  new.created_at = now();
  new.nickname = btrim(new.nickname);
  new.body = btrim(new.body);

  if char_length(new.nickname) not between 1 and 20 then
    raise exception '昵称需要填写 1 至 20 个字符';
  end if;
  if char_length(new.body) not between 1 and 500 then
    raise exception '评论需要填写 1 至 500 个字符';
  end if;

  if exists (
    select 1
    from public.comments
    where visitor_token = new.visitor_token
      and created_at > now() - interval '15 seconds'
  ) then
    raise exception '发表得太快了，请稍后再试';
  end if;

  if new.parent_id is not null then
    select * into parent_comment
    from public.comments
    where id = new.parent_id;

    if not found then
      raise exception '要回复的评论不存在';
    end if;
    if parent_comment.parent_id is not null then
      raise exception '评论仅支持一级回复';
    end if;
    if parent_comment.target_kind <> new.target_kind
      or parent_comment.target_key <> new.target_key then
      raise exception '回复必须属于同一个评论区';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists comments_validate_before_insert on public.comments;
create trigger comments_validate_before_insert
before insert on public.comments
for each row execute function public.validate_comment();

revoke all on function public.validate_comment() from public;

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

create or replace function public.delete_comment(comment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then
    raise exception 'Only the site administrator can delete comments'
      using errcode = '42501';
  end if;

  delete from public.comments
  where id = comment_id;
end;
$$;

revoke all on function public.delete_comment(uuid) from public;
grant execute on function public.delete_comment(uuid) to authenticated;

alter table public.site_admins enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

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

drop policy if exists "Public reads comments" on public.comments;
create policy "Public reads comments"
on public.comments for select
to anon, authenticated
using (true);

drop policy if exists "Public creates comments" on public.comments;
create policy "Public creates comments"
on public.comments for insert
to anon, authenticated
with check (
  target_kind in ('life_image', 'robomaster_node', 'page')
  and target_key ~ '^[a-z0-9][a-z0-9._-]{0,79}$'
  and char_length(btrim(nickname)) between 1 and 20
  and char_length(btrim(body)) between 1 and 500
);

drop policy if exists "Admins delete comments" on public.comments;
create policy "Admins delete comments"
on public.comments for delete
to authenticated
using (public.is_site_admin());

revoke all on table public.comments from anon, authenticated;
grant insert (target_kind, target_key, nickname, body, parent_id, visitor_token)
  on table public.comments to anon, authenticated;
grant delete on table public.comments to authenticated;
revoke all on table public.public_comments from anon, authenticated;
grant select on table public.public_comments to anon, authenticated;

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
