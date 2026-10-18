-- 先在 Supabase Dashboard > Authentication > Users 创建邮箱密码用户，
-- 再把下方邮箱替换成该用户的邮箱并执行本文件。
insert into public.site_admins (user_id)
select id
from auth.users
where email = 'REPLACE_WITH_YOUR_EMAIL'
on conflict (user_id) do nothing;
