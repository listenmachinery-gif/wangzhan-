# ZYRON Heavy Industry Website

使用 Next.js + Tailwind CSS 构建的英文机械设备企业官网项目。

## 网站内容

- 首页
- 产品中心
- 产品详情页
- 工厂实力
- 案例展示
- 新闻文章
- 联系我们

## 技术栈

- Next.js App Router
- React
- Tailwind CSS
- TypeScript
- lucide-react 图标

## 运行

在这个文件夹中安装依赖并启动开发服务：

```bash
npm install
npm run dev
```

默认访问：

```bash
http://localhost:3000
```

正式上线前构建：

```bash
npm run build
npm run start
```

## 目录

```text
app/
  page.tsx                 首页
  products/page.tsx        产品中心
  products/[id]/page.tsx   产品详情页
  factory/page.tsx         工厂实力
  cases/page.tsx           案例展示
  news/page.tsx            新闻文章
  contact/page.tsx         联系我们
components/
  SiteHeader.tsx
  SiteFooter.tsx
data/
  products.ts
  shearing-details.ts
  bending-details.ts
public/
  brand/
  products/
public/products/
  产品图片素材
```
