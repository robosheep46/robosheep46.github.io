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
  kind text not null check (kind in ('weekly', 'story', 'photo')),
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

delete from public.posts where kind = 'moment';

alter table public.posts drop constraint if exists posts_kind_check;
alter table public.posts
  add constraint posts_kind_check check (kind in ('weekly', 'story', 'photo'));

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

delete from storage.objects
where bucket_id = 'content-media'
  and name like 'moment/%';

create table if not exists public.growth_days (
  record_date date primary key,
  did_meaningful boolean not null default false,
  made_breakthrough boolean not null default false,
  private_note text not null default '' check (char_length(private_note) <= 1000),
  color text check (color in ('moon', 'mist', 'pine', 'dusk', 'lilac')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reward_cards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  category text not null check (category in ('five-piece', 'robomaster')),
  person_name text not null check (char_length(btrim(person_name)) between 1 and 80),
  school_name text not null default '',
  title text not null check (char_length(btrim(title)) between 1 and 120),
  quote text not null default '' check (char_length(quote) <= 500),
  source_label text not null default '',
  source_url text not null default '',
  image_query text not null default '',
  image_url text not null default '',
  collection_key text not null default '',
  collection_title text not null default '',
  piece_index integer not null default 0,
  piece_count integer not null default 0,
  full_image_url text not null default '',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.growth_saved_cards (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null unique references public.reward_cards(id) on delete cascade,
  earned_color text not null check (earned_color in ('moon', 'mist', 'pine', 'dusk', 'lilac')),
  saved_year integer not null check (saved_year between 2023 and 9999),
  draw_date date not null default ((now() at time zone 'Asia/Shanghai')::date),
  saved_at timestamptz not null default now()
);

alter table public.reward_cards add column if not exists collection_key text not null default '';
alter table public.reward_cards add column if not exists collection_title text not null default '';
alter table public.reward_cards add column if not exists piece_index integer not null default 0;
alter table public.reward_cards add column if not exists piece_count integer not null default 0;
alter table public.reward_cards add column if not exists full_image_url text not null default '';
delete from public.reward_cards where category = 'figure';
alter table public.reward_cards drop constraint if exists reward_cards_category_check;
alter table public.reward_cards
  add constraint reward_cards_category_check check (category in ('five-piece', 'robomaster'));
alter table public.reward_cards drop constraint if exists reward_cards_piece_shape_check;
alter table public.reward_cards
  add constraint reward_cards_piece_shape_check check (
    category = 'robomaster'
    or (
      category = 'five-piece'
      and collection_key <> ''
      and collection_title <> ''
      and piece_index between 1 and 5
      and piece_count = 5
      and full_image_url <> ''
    )
  );

alter table public.growth_saved_cards add column if not exists draw_date date;
update public.growth_saved_cards
set draw_date = (saved_at at time zone 'Asia/Shanghai')::date
where draw_date is null;
alter table public.growth_saved_cards
  alter column draw_date set default ((now() at time zone 'Asia/Shanghai')::date),
  alter column draw_date set not null;
create unique index if not exists growth_saved_cards_one_per_day_idx
  on public.growth_saved_cards (draw_date);

create table if not exists public.growth_redemptions (
  id uuid primary key default gen_random_uuid(),
  color text not null check (color in ('moon', 'mist', 'pine', 'dusk', 'lilac')),
  group_index integer not null check (group_index > 0),
  saved_card_id uuid not null unique references public.growth_saved_cards(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (color, group_index)
);

insert into public.reward_cards (
  slug, category, person_name, school_name, title, quote,
  source_label, source_url, image_query, image_url,
  collection_key, collection_title, piece_index, piece_count, full_image_url,
  sort_order, is_visible
)
values
  ('five-road-underfoot-01', 'five-piece', '鲁迅', '', '路在脚下', '', '五联卡合集', '', '', '/media/growth-cards/road-underfoot/01.png', 'road-underfoot', '路在脚下', 1, 5, '/media/growth-cards/road-underfoot/full.png', 0, true),
  ('five-road-underfoot-02', 'five-piece', '老子', '', '路在脚下', '', '五联卡合集', '', '', '/media/growth-cards/road-underfoot/02.png', 'road-underfoot', '路在脚下', 2, 5, '/media/growth-cards/road-underfoot/full.png', 1, true),
  ('five-road-underfoot-03', 'five-piece', '陆游', '', '路在脚下', '', '五联卡合集', '', '', '/media/growth-cards/road-underfoot/03.png', 'road-underfoot', '路在脚下', 3, 5, '/media/growth-cards/road-underfoot/full.png', 2, true),
  ('five-road-underfoot-04', 'five-piece', '王阳明', '', '路在脚下', '', '五联卡合集', '', '', '/media/growth-cards/road-underfoot/04.png', 'road-underfoot', '路在脚下', 4, 5, '/media/growth-cards/road-underfoot/full.png', 3, true),
  ('five-road-underfoot-05', 'five-piece', '陶行知', '', '路在脚下', '', '五联卡合集', '', '', '/media/growth-cards/road-underfoot/05.png', 'road-underfoot', '路在脚下', 5, 5, '/media/growth-cards/road-underfoot/full.png', 4, true),
  ('five-living-water-01', 'five-piece', '孔子', '', '学问如活水', '', '五联卡合集', '', '', '/media/growth-cards/living-water/01.png', 'living-water', '学问如活水', 1, 5, '/media/growth-cards/living-water/full.png', 10, true),
  ('five-living-water-02', 'five-piece', '荀子', '', '学问如活水', '', '五联卡合集', '', '', '/media/growth-cards/living-water/02.png', 'living-water', '学问如活水', 2, 5, '/media/growth-cards/living-water/full.png', 11, true),
  ('five-living-water-03', 'five-piece', '韩愈', '', '学问如活水', '', '五联卡合集', '', '', '/media/growth-cards/living-water/03.png', 'living-water', '学问如活水', 3, 5, '/media/growth-cards/living-water/full.png', 12, true),
  ('five-living-water-04', 'five-piece', '叶圣陶', '', '学问如活水', '', '五联卡合集', '', '', '/media/growth-cards/living-water/04.png', 'living-water', '学问如活水', 4, 5, '/media/growth-cards/living-water/full.png', 13, true),
  ('five-living-water-05', 'five-piece', '朱熹', '', '学问如活水', '', '五联卡合集', '', '', '/media/growth-cards/living-water/05.png', 'living-water', '学问如活水', 5, 5, '/media/growth-cards/living-water/full.png', 14, true),
  ('five-aim-high-01', 'five-piece', '曹操', '', '志在高处', '', '五联卡合集', '', '', '/media/growth-cards/aim-high/01.png', 'aim-high', '志在高处', 1, 5, '/media/growth-cards/aim-high/full.png', 20, true),
  ('five-aim-high-02', 'five-piece', '王勃', '', '志在高处', '', '五联卡合集', '', '', '/media/growth-cards/aim-high/02.png', 'aim-high', '志在高处', 2, 5, '/media/growth-cards/aim-high/full.png', 21, true),
  ('five-aim-high-03', 'five-piece', '王之涣', '', '志在高处', '', '五联卡合集', '', '', '/media/growth-cards/aim-high/03.png', 'aim-high', '志在高处', 3, 5, '/media/growth-cards/aim-high/full.png', 22, true),
  ('five-aim-high-04', 'five-piece', '杜甫', '', '志在高处', '', '五联卡合集', '', '', '/media/growth-cards/aim-high/04.png', 'aim-high', '志在高处', 4, 5, '/media/growth-cards/aim-high/full.png', 23, true),
  ('five-aim-high-05', 'five-piece', '李贺', '', '志在高处', '', '五联卡合集', '', '', '/media/growth-cards/aim-high/05.png', 'aim-high', '志在高处', 5, 5, '/media/growth-cards/aim-high/full.png', 24, true),
  ('five-tempered-light-01', 'five-piece', '毛泽东', '', '磨砺成光', '', '五联卡合集', '', '', '/media/growth-cards/tempered-light/01.png', 'tempered-light', '磨砺成光', 1, 5, '/media/growth-cards/tempered-light/full.png', 30, true),
  ('five-tempered-light-02', 'five-piece', '孟子', '', '磨砺成光', '', '五联卡合集', '', '', '/media/growth-cards/tempered-light/02.png', 'tempered-light', '磨砺成光', 2, 5, '/media/growth-cards/tempered-light/full.png', 31, true),
  ('five-tempered-light-03', 'five-piece', '李白', '', '磨砺成光', '', '五联卡合集', '', '', '/media/growth-cards/tempered-light/03.png', 'tempered-light', '磨砺成光', 3, 5, '/media/growth-cards/tempered-light/full.png', 32, true),
  ('five-tempered-light-04', 'five-piece', '刘禹锡', '', '磨砺成光', '', '五联卡合集', '', '', '/media/growth-cards/tempered-light/04.png', 'tempered-light', '磨砺成光', 4, 5, '/media/growth-cards/tempered-light/full.png', 33, true),
  ('five-tempered-light-05', 'five-piece', '郑燮', '', '磨砺成光', '', '五联卡合集', '', '', '/media/growth-cards/tempered-light/05.png', 'tempered-light', '磨砺成光', 5, 5, '/media/growth-cards/tempered-light/full.png', 34, true),
  ('five-world-at-heart-01', 'five-piece', '范仲淹', '', '心怀天下', '', '五联卡合集', '', '', '/media/growth-cards/world-at-heart/01.png', 'world-at-heart', '心怀天下', 1, 5, '/media/growth-cards/world-at-heart/full.png', 40, true),
  ('five-world-at-heart-02', 'five-piece', '张载', '', '心怀天下', '', '五联卡合集', '', '', '/media/growth-cards/world-at-heart/02.png', 'world-at-heart', '心怀天下', 2, 5, '/media/growth-cards/world-at-heart/full.png', 41, true),
  ('five-world-at-heart-03', 'five-piece', '顾炎武', '', '心怀天下', '', '五联卡合集', '', '', '/media/growth-cards/world-at-heart/03.png', 'world-at-heart', '心怀天下', 3, 5, '/media/growth-cards/world-at-heart/full.png', 42, true),
  ('five-world-at-heart-04', 'five-piece', '林则徐', '', '心怀天下', '', '五联卡合集', '', '', '/media/growth-cards/world-at-heart/04.png', 'world-at-heart', '心怀天下', 4, 5, '/media/growth-cards/world-at-heart/full.png', 43, true),
  ('five-world-at-heart-05', 'five-piece', '梁启超', '', '心怀天下', '', '五联卡合集', '', '', '/media/growth-cards/world-at-heart/05.png', 'world-at-heart', '心怀天下', 5, 5, '/media/growth-cards/world-at-heart/full.png', 44, true),
  ('five-steadfast-character-01', 'five-piece', '墨子', '', '风骨自成', '', '五联卡合集', '', '', '/media/growth-cards/steadfast-character/01.png', 'steadfast-character', '风骨自成', 1, 5, '/media/growth-cards/steadfast-character/full.png', 50, true),
  ('five-steadfast-character-02', 'five-piece', '白居易', '', '风骨自成', '', '五联卡合集', '', '', '/media/growth-cards/steadfast-character/02.png', 'steadfast-character', '风骨自成', 2, 5, '/media/growth-cards/steadfast-character/full.png', 51, true),
  ('five-steadfast-character-03', 'five-piece', '于谦', '', '风骨自成', '', '五联卡合集', '', '', '/media/growth-cards/steadfast-character/03.png', 'steadfast-character', '风骨自成', 3, 5, '/media/growth-cards/steadfast-character/full.png', 52, true),
  ('five-steadfast-character-04', 'five-piece', '张衡', '', '风骨自成', '', '五联卡合集', '', '', '/media/growth-cards/steadfast-character/04.png', 'steadfast-character', '风骨自成', 4, 5, '/media/growth-cards/steadfast-character/full.png', 53, true),
  ('five-steadfast-character-05', 'five-piece', '王冕', '', '风骨自成', '', '五联卡合集', '', '', '/media/growth-cards/steadfast-character/05.png', 'steadfast-character', '风骨自成', 5, 5, '/media/growth-cards/steadfast-character/full.png', 54, true),
  ('five-devotion-01', 'five-piece', '文天祥', '', '赤诚与奉献', '', '五联卡合集', '', '', '/media/growth-cards/devotion/01.png', 'devotion', '赤诚与奉献', 1, 5, '/media/growth-cards/devotion/full.png', 60, true),
  ('five-devotion-02', 'five-piece', '顾宪成', '', '赤诚与奉献', '', '五联卡合集', '', '', '/media/growth-cards/devotion/02.png', 'devotion', '赤诚与奉献', 2, 5, '/media/growth-cards/devotion/full.png', 61, true),
  ('five-devotion-03', 'five-piece', '巴金', '', '赤诚与奉献', '', '五联卡合集', '', '', '/media/growth-cards/devotion/03.png', 'devotion', '赤诚与奉献', 3, 5, '/media/growth-cards/devotion/full.png', 62, true),
  ('five-devotion-04', 'five-piece', '秋瑾', '', '赤诚与奉献', '', '五联卡合集', '', '', '/media/growth-cards/devotion/04.png', 'devotion', '赤诚与奉献', 4, 5, '/media/growth-cards/devotion/full.png', 63, true),
  ('five-devotion-05', 'five-piece', '戚继光', '', '赤诚与奉献', '', '五联卡合集', '', '', '/media/growth-cards/devotion/05.png', 'devotion', '赤诚与奉献', 5, 5, '/media/growth-cards/devotion/full.png', 64, true),
  ('five-inner-light-01', 'five-piece', '屈原', '', '内心自有光', '', '五联卡合集', '', '', '/media/growth-cards/inner-light/01.png', 'inner-light', '内心自有光', 1, 5, '/media/growth-cards/inner-light/full.png', 70, true),
  ('five-inner-light-02', 'five-piece', '诸葛亮', '', '内心自有光', '', '五联卡合集', '', '', '/media/growth-cards/inner-light/02.png', 'inner-light', '内心自有光', 2, 5, '/media/growth-cards/inner-light/full.png', 71, true),
  ('five-inner-light-03', 'five-piece', '龚自珍', '', '内心自有光', '', '五联卡合集', '', '', '/media/growth-cards/inner-light/03.png', 'inner-light', '内心自有光', 3, 5, '/media/growth-cards/inner-light/full.png', 72, true),
  ('five-inner-light-04', 'five-piece', '林徽因', '', '内心自有光', '', '五联卡合集', '', '', '/media/growth-cards/inner-light/04.png', 'inner-light', '内心自有光', 4, 5, '/media/growth-cards/inner-light/full.png', 73, true),
  ('five-inner-light-05', 'five-piece', '李清照', '', '内心自有光', '', '五联卡合集', '', '', '/media/growth-cards/inner-light/05.png', 'inner-light', '内心自有光', 5, 5, '/media/growth-cards/inner-light/full.png', 74, true)
on conflict (slug) do update set
  category = excluded.category,
  person_name = excluded.person_name,
  title = excluded.title,
  quote = excluded.quote,
  source_label = excluded.source_label,
  source_url = excluded.source_url,
  image_query = excluded.image_query,
  image_url = excluded.image_url,
  collection_key = excluded.collection_key,
  collection_title = excluded.collection_title,
  piece_index = excluded.piece_index,
  piece_count = excluded.piece_count,
  full_image_url = excluded.full_image_url,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible,
  updated_at = now();

create or replace function public.validate_growth_day()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  today_in_beijing date := (now() at time zone 'Asia/Shanghai')::date;
  palette text[] := array['moon', 'mist', 'pine', 'dusk', 'lilac'];
begin
  if not public.is_site_admin() then
    raise exception 'Only the site administrator can edit growth days'
      using errcode = '42501';
  end if;
  if new.record_date not in (today_in_beijing, today_in_beijing - 1) then
    raise exception 'Only today and yesterday can be edited';
  end if;
  new.private_note := btrim(coalesce(new.private_note, ''));
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    new.color := old.color;
  elsif (new.did_meaningful or new.made_breakthrough) and new.color is null then
    new.color := palette[1 + floor(random() * array_length(palette, 1))::integer];
  end if;
  return new;
end;
$$;

revoke all on function public.validate_growth_day() from public;
drop trigger if exists growth_days_validate_before_write on public.growth_days;
create trigger growth_days_validate_before_write
before insert or update on public.growth_days
for each row execute function public.validate_growth_day();

drop trigger if exists reward_cards_touch_updated_at on public.reward_cards;
create trigger reward_cards_touch_updated_at
before update on public.reward_cards
for each row execute function public.touch_updated_at();

create or replace view public.public_growth_days as
select record_date, color
from public.growth_days
where (did_meaningful or made_breakthrough)
  and color is not null;

create or replace view public.public_saved_growth_cards as
select
  saved.id as saved_id,
  saved.saved_year,
  saved.draw_date,
  saved.saved_at,
  saved.earned_color,
  cards.id,
  cards.slug,
  cards.category,
  cards.person_name,
  cards.school_name,
  cards.title,
  cards.quote,
  cards.source_label,
  cards.source_url,
  cards.image_query,
  cards.image_url,
  cards.collection_key,
  cards.collection_title,
  cards.piece_index,
  cards.piece_count,
  cards.full_image_url,
  cards.sort_order
from public.growth_saved_cards as saved
join public.reward_cards as cards on cards.id = saved.card_id;

create or replace function public.growth_reward_status()
returns table (color text, lit_count bigint, redeemed_count bigint, available_count bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then
    raise exception 'Only the site administrator can view reward balances'
      using errcode = '42501';
  end if;
  return query
  with palette(color) as (
    values ('moon'::text), ('mist'), ('pine'), ('dusk'), ('lilac')
  ), lit as (
    select growth_days.color, count(*) as count
    from public.growth_days
    where (did_meaningful or made_breakthrough) and growth_days.color is not null
    group by growth_days.color
  ), redeemed as (
    select growth_redemptions.color, count(*) as count
    from public.growth_redemptions
    group by growth_redemptions.color
  )
  select
    palette.color,
    coalesce(lit.count, 0)::bigint,
    coalesce(redeemed.count, 0)::bigint,
    greatest(0, floor(coalesce(lit.count, 0) / 5.0)::bigint - coalesce(redeemed.count, 0)::bigint)
  from palette
  left join lit using (color)
  left join redeemed using (color);
end;
$$;

drop function if exists public.save_growth_card(uuid, text);
drop function if exists public.save_growth_card(uuid, text, date);
create function public.save_growth_card(p_card_id uuid, p_color text, p_draw_date date)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  lit_total bigint;
  redeemed_total bigint;
  saved_id uuid;
  next_group integer;
  today_in_beijing date := (now() at time zone 'Asia/Shanghai')::date;
begin
  if not public.is_site_admin() then
    raise exception 'Only the site administrator can save cards'
      using errcode = '42501';
  end if;
  if p_color not in ('moon', 'mist', 'pine', 'dusk', 'lilac') then
    raise exception 'Unknown growth color';
  end if;
  if p_draw_date <> today_in_beijing then
    raise exception 'Only today''s drawn card can be saved';
  end if;
  perform pg_advisory_xact_lock(hashtext('growth-save-day-' || p_draw_date::text));
  if exists (select 1 from public.growth_saved_cards where draw_date = p_draw_date) then
    return jsonb_build_object('status', 'day-used');
  end if;
  if exists (select 1 from public.growth_saved_cards where card_id = p_card_id) then
    return jsonb_build_object('status', 'duplicate');
  end if;
  if not exists (select 1 from public.reward_cards where id = p_card_id and is_visible) then
    raise exception 'The card does not exist or is hidden';
  end if;
  perform pg_advisory_xact_lock(hashtext('growth-reward-' || p_color));
  select count(*) into lit_total
  from public.growth_days
  where color = p_color and (did_meaningful or made_breakthrough);
  select count(*) into redeemed_total
  from public.growth_redemptions
  where color = p_color;
  if floor(lit_total / 5.0) <= redeemed_total then
    raise exception 'No reward balance is available for this color';
  end if;
  next_group := redeemed_total + 1;
  insert into public.growth_saved_cards (card_id, earned_color, saved_year, draw_date)
  values (p_card_id, p_color, extract(year from p_draw_date)::integer, p_draw_date)
  returning id into saved_id;
  insert into public.growth_redemptions (color, group_index, saved_card_id)
  values (p_color, next_group, saved_id);
  return jsonb_build_object('status', 'saved', 'saved_id', saved_id);
end;
$$;

revoke all on function public.growth_reward_status() from public;
grant execute on function public.growth_reward_status() to authenticated;
revoke all on function public.save_growth_card(uuid, text, date) from public;
grant execute on function public.save_growth_card(uuid, text, date) to authenticated;

alter table public.growth_days enable row level security;
alter table public.reward_cards enable row level security;
alter table public.growth_saved_cards enable row level security;
alter table public.growth_redemptions enable row level security;

drop policy if exists "Admins read growth days" on public.growth_days;
create policy "Admins read growth days" on public.growth_days for select to authenticated using (public.is_site_admin());
drop policy if exists "Admins create growth days" on public.growth_days;
create policy "Admins create growth days" on public.growth_days for insert to authenticated with check (public.is_site_admin());
drop policy if exists "Admins update growth days" on public.growth_days;
create policy "Admins update growth days" on public.growth_days for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "Public reads visible reward cards" on public.reward_cards;
create policy "Public reads visible reward cards" on public.reward_cards for select to anon, authenticated using (is_visible or public.is_site_admin());
drop policy if exists "Admins create reward cards" on public.reward_cards;
create policy "Admins create reward cards" on public.reward_cards for insert to authenticated with check (public.is_site_admin());
drop policy if exists "Admins update reward cards" on public.reward_cards;
create policy "Admins update reward cards" on public.reward_cards for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());
drop policy if exists "Admins delete reward cards" on public.reward_cards;
create policy "Admins delete reward cards" on public.reward_cards for delete to authenticated using (public.is_site_admin());

drop policy if exists "Admins read saved growth cards" on public.growth_saved_cards;
create policy "Admins read saved growth cards" on public.growth_saved_cards for select to authenticated using (public.is_site_admin());
drop policy if exists "Admins read growth redemptions" on public.growth_redemptions;
create policy "Admins read growth redemptions" on public.growth_redemptions for select to authenticated using (public.is_site_admin());

revoke all on table public.growth_days from anon, authenticated;
grant select, insert, update on table public.growth_days to authenticated;
revoke all on table public.reward_cards from anon, authenticated;
grant select on table public.reward_cards to anon, authenticated;
grant insert, update, delete on table public.reward_cards to authenticated;
revoke all on table public.growth_saved_cards from anon, authenticated;
grant select on table public.growth_saved_cards to authenticated;
revoke all on table public.growth_redemptions from anon, authenticated;
grant select on table public.growth_redemptions to authenticated;
revoke all on table public.public_growth_days from anon, authenticated;
grant select on table public.public_growth_days to anon, authenticated;
revoke all on table public.public_saved_growth_cards from anon, authenticated;
grant select on table public.public_saved_growth_cards to anon, authenticated;
