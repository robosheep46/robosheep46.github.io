# robosheep 的小站

一个公开的个人网站，用于记录成长档案、周报、生活相册、兴趣爱好和动态。公开页面保持原生 HTML、CSS、JavaScript，托管在 GitHub Pages；周报和动态通过 Supabase 提供私人发布后台。

## 本地查看

公开静态页面可以直接打开 `index.html`。需要测试后台或 Supabase 请求时，请在项目目录运行静态服务器，例如：

```powershell
npx serve .
```

## 配置 Supabase

1. 在 Supabase 创建一个免费项目。
2. 在 SQL Editor 中执行 [`supabase/setup.sql`](./supabase/setup.sql)。
3. 在 Authentication > Users 中创建唯一的站长邮箱密码用户。
4. 修改并执行 [`supabase/grant-admin.sql`](./supabase/grant-admin.sql)，把占位邮箱替换成站长邮箱。
5. 在 Supabase Project Settings > API 中找到 Project URL 和 anon public key。
6. 把两项填写到 [`site-config.js`](./site-config.js)。匿名密钥用于受 RLS 保护的公开客户端，不要填写 `service_role` 密钥。
7. 打开 `/admin.html` 登录。第一次进入周报页签时，点击“导入两篇旧周报”。

## 内容入口

- `/stories/weekly.html`：公开周报目录
- `/stories/moments.html`：公开动态时间线
- `/admin.html`：私人发布后台

后台支持草稿、公开、隐藏、编辑和删除。上传图片会在浏览器中压缩为 JPEG，从而移除原图中的 EXIF 定位信息。
