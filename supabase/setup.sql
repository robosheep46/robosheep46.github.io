create extension if not exists pgcrypto;

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 1 and 20),
  avatar_url text,
  provider text not null default 'email',
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('moment', 'weekly', 'story', 'photo')),
  slug text not null,
  title text not null default '',
  body text not null default '',
  sections jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
  happened_at timestamptz not null,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  target_kind text not null check (target_kind in ('life_image', 'story_node', 'page')),
  target_key text not null check (target_key ~ '^[a-z0-9][a-z0-9._-]{0,79}$'),
  nickname text not null check (char_length(btrim(nickname)) between 1 and 20),
  body text not null check (char_length(btrim(body)) between 1 and 500),
  parent_id uuid references public.comments(id) on delete cascade,
  visitor_token uuid not null,
  created_at timestamptz not null default now()
);

alter table public.comments
  add column if not exists author_id uuid references auth.users(id) on delete set null;

alter table public.posts
  add column if not exists sort_order integer not null default 0;

alter table public.posts drop constraint if exists posts_kind_check;
alter table public.posts
  add constraint posts_kind_check check (kind in ('moment', 'weekly', 'story', 'photo'));

alter table public.comments drop constraint if exists comments_target_kind_check;
update public.comments
set target_kind = 'story_node'
where target_kind = 'robomaster_node';
alter table public.comments
  add constraint comments_target_kind_check check (target_kind in ('life_image', 'story_node', 'page'));

insert into public.posts (
  kind, slug, title, body, sections, images, status, happened_at, published_at, sort_order
)
values (
  'story',
  '2023-robomaster',
  'RoboMaster',
  '从想证明自己，到第一次真正看见代码动起来。',
  $story$[
    {
      "key": "2023-09",
      "month": "2023-09",
      "heading": "我想证明，我不属于这里",
      "paragraphs": [
        "2023 年 9 月，我来到一所二本院校。",
        "那时的我认定这所学校很差，也把来到这里视为一种失败。我觉得天塌了，甚至觉得这是一件无比耻辱的事。",
        "大一上学期，我开始拼命证明自己。我想拿到军训标兵，想拿专业第一，想进入机甲大师实验室。我希望在每一个可以比较的地方赢下来，证明自己足够强，也证明自己不应该属于这里。",
        "我想这样做，也确实做到了。那个学期，我拿到了军训标兵，拿到了全专业绩点第一，也成功加入了机甲大师实验室。按照当时的标准，这几乎是一个完美的结果。",
        "现在回头看，那时的我不配打RM，因为我并不是真正热爱比赛，只是简单的证明失败的不是我罢了。"
      ]
    },
    {
      "key": "2024-01",
      "month": "2024-01",
      "heading": "我拿到了第一，却只会点灯",
      "paragraphs": [
        "加入实验室以后，我很快发现，“第一”并没有给我带来答案。",
        "2024 年大一下学期，师兄开始给我安排各种工作：数据标注、训练模型、制作 PPT、整理 PPT 比赛要求的文档，还有视频剪辑。这些事情我都做了。我每天看起来很忙，也确实完成了不少任务。但如果问我在电控方面学会了什么，我很难给出一个像样的回答。",
        "我就这样忙忙碌碌地虚度光阴。甚至看到此处，你都无法猜到我到底属于哪个组别。那我现在告诉你：电控组。如果你问当时的我会什么，我只能很诚实地回答：调用一个函数，然后点亮一盏灯。",
        "当时还是打开教学视频，照着别人敲代码，编译、下载，只要灯亮了，就算成功。至于代码为什么要这样写，程序又是怎么运行起来的，我说不清楚。听起来有些荒唐，但当时确实如此。",
        "我曾经以为，加入实验室就意味着自己已经迈进了技术的大门。后来才发现，我只是拿到了站在门口的资格。"
      ]
    },
    {
      "key": "2024-03",
      "month": "2024-03",
      "heading": "一场没赢的广东站",
      "paragraphs": [
        "2024 年 3 月，我作为梯队队员，第一次来到 RoboMaster 广东站。",
        "那次比赛，我没有真正上场，主要站在一旁观察和学习。",
        "赛场上有各种各样的机器人。有些车的结构、动作和完成度，光是看着就让人觉得很酷。",
        "然后我再回头看自己的队伍。1V1 没赢，3V3 也没赢。一场胜利都没有。我第一次如此具体地看见，我们和别人之间究竟隔着多远。但真正让我感到无力的事情，还在比赛结束以后。"
      ]
    },
    {
      "key": "2024-04",
      "month": "2024-04",
      "heading": "第一次看技术报告",
      "paragraphs": [
        "比赛结束后，学长整理了大量文档和技术报告。里面记录着电控组在比赛中暴露出来的问题，也列出了许多需要继续整改的地方。学长希望后来的人能够接着做，把这些问题一个个解决掉。",
        "问题是，当时电控组里没有大二成员，只有大三，技术传承中间几乎断了一层。而我没有真正写过代码，也没有独立解决过什么技术问题。报告里的每一个问题都在等人处理，可我连报告里在写什么都看不懂。",
        "这就像有人把维修手册递给一个只会开灯的人，然后告诉他：接下来，你来修。"
      ]
    },
    {
      "key": "2024-05",
      "month": "2024-05",
      "heading": "第一个任务",
      "paragraphs": [
        "2024 年 5 月比赛结束后，刘可学长开始用任务的方式引导我。每个星期，他都会安排一个具体任务，让我自己查资料、理解，再想办法完成。",
        "我依稀记得，第一周的任务是整理以前的代码。我要把散落在代码各处的变量写进结构体，再把不同的结构体集中到同一个头文件里。当时学校C语言课程只考到函数，所以那时的我既不知道什么是结构体，也不知道什么是头文件。我只能先去 B 站搜索“结构体是什么”，弄明白最基本的概念，再回到原来的代码里，一点点理解刘可学长到底要我改什么。"
      ]
    },
    {
      "key": "2024-06",
      "month": "2024-06",
      "heading": "第一次观察数据",
      "paragraphs": [
        "第二周的任务，是采集遥控器的数据。我继续跟着 B 站的视频，了解遥控器协议，了解串口，再尝试把这些刚刚认识的概念放进真实代码里。我在 Keil5 中把遥控器的数据加入 Watch 窗口。拨动了一下遥控器的摇杆。keil5里的数据也跟着发生了变化。",
        "当时的我真的非常开心。因为我不再是只会点灯，而是能试着理解为什么这么做了，那是我第一次真切地感觉到，代码其实不是对着视频去照抄。",
        "我曾经以为，“第一”就是答案。但在 2024 年 5 月，比起成绩单上的专业第一，那个跟着摇杆一起变化的数字，似乎更接近我真正想找到的东西。"
      ]
    }
  ]$story$::jsonb,
  '[{"url":"/media/archive-cover.jpg?v=1","path":""}]'::jsonb,
  'published',
  '2023-09-01 12:00:00+08',
  '2023-09-01 12:00:00+08',
  0
)
on conflict (kind, slug) do nothing;

insert into public.posts (
  kind, slug, title, body, sections, images, status, happened_at, published_at, sort_order
)
values
  (
    'photo', '2026-10-17-pork', '斌哥给我夹的锅包肉', '斌哥给我夹的锅包肉', '[]'::jsonb,
    '[{"url":"/media/2026-10-17-pork.jpg","path":""}]'::jsonb,
    'published', '2026-10-17 12:00:00+08', '2026-10-17 12:00:00+08', 0
  ),
  (
    'photo', '2026-10-17-stew', '第二次和斌哥一起吃铁锅炖', '第二次和斌哥一起吃铁锅炖', '[]'::jsonb,
    '[{"url":"/media/2026-10-17-stew.jpg","path":""}]'::jsonb,
    'published', '2026-10-17 11:00:00+08', '2026-10-17 11:00:00+08', 1
  )
on conflict (kind, slug) do nothing;

create or replace view public.public_comments as
select
  comments.id,
  comments.target_kind,
  comments.target_key,
  coalesce(profiles.nickname, comments.nickname) as nickname,
  comments.body,
  comments.parent_id,
  comments.created_at,
  profiles.avatar_url,
  (comments.author_id is not null) as is_registered
from public.comments
left join public.profiles on profiles.user_id = comments.author_id;

create index if not exists posts_public_timeline_idx
  on public.posts (kind, status, happened_at desc);

create index if not exists posts_public_order_idx
  on public.posts (kind, status, sort_order asc);

create index if not exists comments_target_timeline_idx
  on public.comments (target_kind, target_key, created_at asc);

create index if not exists comments_parent_idx
  on public.comments (parent_id)
  where parent_id is not null;

create index if not exists comments_author_idx
  on public.comments (author_id)
  where author_id is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_nickname text;
begin
  profile_nickname := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'nickname'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'user_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'preferred_username'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(new.email, '@', 1), ''),
    '访客'
  );

  insert into public.profiles (user_id, nickname, avatar_url, provider)
  values (
    new.id,
    left(profile_nickname, 20),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    coalesce(new.raw_app_meta_data ->> 'provider', 'email')
  )
  on conflict (user_id) do update set
    nickname = excluded.nickname,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    provider = excluded.provider;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of raw_user_meta_data, raw_app_meta_data on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (user_id, nickname, avatar_url, provider)
select
  users.id,
  left(coalesce(
    nullif(btrim(users.raw_user_meta_data ->> 'nickname'), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'user_name'), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'preferred_username'), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(users.email, '@', 1), ''),
    '访客'
  ), 20),
  nullif(users.raw_user_meta_data ->> 'avatar_url', ''),
  coalesce(users.raw_app_meta_data ->> 'provider', 'email')
from auth.users as users
on conflict (user_id) do nothing;

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

create or replace function public.cleanup_post_comments()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.kind = 'story' then
      delete from public.comments as comment
      where comment.target_kind = 'story_node'
        and exists (
          select 1
          from jsonb_array_elements(coalesce(old.sections, '[]'::jsonb)) as section
          where section ->> 'key' = comment.target_key
        );
    elsif old.kind = 'photo' then
      delete from public.comments
      where target_kind = 'life_image'
        and target_key = old.slug;
    end if;
    return old;
  end if;

  if old.kind = 'story' then
    delete from public.comments as comment
    where comment.target_kind = 'story_node'
      and exists (
        select 1
        from jsonb_array_elements(coalesce(old.sections, '[]'::jsonb)) as old_section
        where old_section ->> 'key' = comment.target_key
      )
      and (
        new.kind <> 'story'
        or not exists (
          select 1
          from jsonb_array_elements(coalesce(new.sections, '[]'::jsonb)) as new_section
          where new_section ->> 'key' = comment.target_key
        )
      );
  end if;

  if old.kind = 'photo'
    and (new.kind <> 'photo' or new.slug is distinct from old.slug) then
    delete from public.comments
    where target_kind = 'life_image'
      and target_key = old.slug;
  end if;

  return new;
end;
$$;

revoke all on function public.cleanup_post_comments() from public;

drop trigger if exists posts_cleanup_comments on public.posts;
create trigger posts_cleanup_comments
after update of kind, slug, sections or delete on public.posts
for each row execute function public.cleanup_post_comments();

create or replace function public.validate_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parent_comment public.comments%rowtype;
  account_nickname text;
begin
  new.id = gen_random_uuid();
  new.created_at = now();
  new.author_id = auth.uid();
  new.nickname = btrim(new.nickname);
  new.body = btrim(new.body);

  if new.author_id is not null then
    select profiles.nickname into account_nickname
    from public.profiles
    where profiles.user_id = new.author_id;
    new.nickname = coalesce(account_nickname, new.nickname);
    new.visitor_token = gen_random_uuid();
  end if;

  if char_length(new.nickname) not between 1 and 20 then
    raise exception '昵称需要填写 1 至 20 个字符';
  end if;
  if char_length(new.body) not between 1 and 500 then
    raise exception '评论需要填写 1 至 500 个字符';
  end if;

  perform 1
  from public.comments as recent_comment
  where recent_comment.created_at > now() - interval '15 seconds'
    and (
      recent_comment.visitor_token = new.visitor_token
      or (
        new.author_id is not null
        and recent_comment.author_id = new.author_id
      )
    )
  limit 1;

  if found then
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

create or replace function public.owned_comment_ids(requester_token uuid)
returns table(comment_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.comments
  where visitor_token = requester_token
    or (auth.uid() is not null and author_id = auth.uid());
$$;

revoke all on function public.owned_comment_ids(uuid) from public;
grant execute on function public.owned_comment_ids(uuid) to anon, authenticated;

create or replace function public.delete_own_comment(
  requested_comment_id uuid,
  requester_token uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_rows integer;
begin
  delete from public.comments
  where id = requested_comment_id
    and (
      visitor_token = requester_token
      or (auth.uid() is not null and author_id = auth.uid())
    );

  get diagnostics deleted_rows = row_count;
  if deleted_rows = 0 then
    raise exception 'This comment does not belong to this browser'
      using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.delete_own_comment(uuid, uuid) from public;
grant execute on function public.delete_own_comment(uuid, uuid) to anon, authenticated;

create or replace function public.claim_visitor_comments(requester_token uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_rows integer;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to claim comments'
      using errcode = '42501';
  end if;

  update public.comments
  set
    author_id = auth.uid(),
    visitor_token = gen_random_uuid()
  where visitor_token = requester_token
    and author_id is null;

  get diagnostics claimed_rows = row_count;
  return claimed_rows;
end;
$$;

revoke all on function public.claim_visitor_comments(uuid) from public;
grant execute on function public.claim_visitor_comments(uuid) to authenticated;

alter table public.site_admins enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select
to authenticated
using (user_id = auth.uid());

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
  target_kind in ('life_image', 'story_node', 'page')
  and target_key ~ '^[a-z0-9][a-z0-9._-]{0,79}$'
  and char_length(btrim(nickname)) between 1 and 20
  and char_length(btrim(body)) between 1 and 500
  and author_id is not distinct from auth.uid()
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
grant select on table public.posts to anon, authenticated;
grant insert, update, delete on table public.posts to authenticated;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
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
