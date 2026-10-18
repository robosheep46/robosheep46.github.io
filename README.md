# robosheep 的小站

一个公开的个人网站，用于记录成长档案、周报、生活相册、兴趣爱好和动态。公开页面保持原生 HTML、CSS、JavaScript，托管在 GitHub Pages；周报和动态通过 Supabase 提供私人发布后台。

## 本地查看

公开静态页面可以直接打开 `index.html`。需要测试后台或 Supabase 请求时，请在项目目录运行静态服务器，例如：

```powershell
npx serve .
```

## 配置 Supabase

1. 在 Supabase 创建一个免费项目。
2. 在 SQL Editor 中完整执行 [`supabase/setup.sql`](./supabase/setup.sql)，创建内容、账号资料、评论、权限和图片存储结构。已有项目也可以重复执行，用于升级结构。
3. 在 Authentication > Users 中创建唯一的站长邮箱密码用户。
4. 修改并执行 [`supabase/grant-admin.sql`](./supabase/grant-admin.sql)，把占位邮箱替换成站长邮箱。
5. 在 Supabase Project Settings > API 中找到 Project URL 和 anon public key。
6. 把两项填写到 [`site-config.js`](./site-config.js)。匿名密钥用于受 RLS 保护的公开客户端，不要填写 `service_role` 密钥。
7. 打开 `/admin.html` 登录。第一次进入周报页签时，点击“导入两篇旧周报”。

## 配置公开账号

1. 在 Authentication 的 Email 登录设置中关闭注册邮箱确认，使站内注册完成后直接登录。
2. 在 Authentication 的 URL Configuration 中，把 Site URL 设为 `https://robosheep46.github.io/`，并把 `https://robosheep46.github.io/**` 和 `http://localhost:4173/**` 加入 Redirect URLs。
3. 忘记密码依赖 Supabase 发信。面向普通访客开放前，需要在 Authentication 的 SMTP Settings 中配置可公开发信的 SMTP；Supabase 默认邮件服务只适合开发测试。
4. 在 GitHub Developer Settings 中新建 OAuth App：Homepage URL 填 `https://robosheep46.github.io/`，Authorization callback URL 填 `https://btcyayernxdxmzymkhqp.supabase.co/auth/v1/callback`。
5. 把 GitHub OAuth App 的 Client ID 和 Client Secret 填入 Supabase Authentication > Providers > GitHub 并启用。

公开账号入口为 `/account.html`。站内账号使用昵称首字作为头像，GitHub 账号使用 GitHub 昵称和头像；邮箱不会显示在公开评论中。

## 内容入口

- `/stories/weekly.html`：公开周报目录
- `/stories/moments.html`：公开动态时间线
- `/admin.html`：私人发布后台

后台支持草稿、公开、隐藏、编辑、删除和评论管理。公开评论无需注册，受长度、一级回复、发送间隔和 RLS 权限约束；游客第一次发表时填写昵称，浏览器会静默记住。访客可在原浏览器删除自己的评论；注册或登录后，同一浏览器中过去的游客评论会自动归入账号，此后可跨设备删除。站长可以删除全部评论。上传图片会在浏览器中压缩为 JPEG，从而移除原图中的 EXIF 定位信息。
