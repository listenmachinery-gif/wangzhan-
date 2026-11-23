# ZYRON 首页与后台可视化管理改版设计

## 目标

在现有 ZYRON Next.js 网站和 PageBuilder 上完成首页改版，使 Hero Banner、About ZYRON、Our Products、Why Choose ZYRON、News and Insights、Contact CTA 六个首页内容模块可以在后台统一编辑；Footer 继续复用现有导航管理系统。改版使用用户提供的 ZYRON 图片与英文文案，保留现有产品、SEO、询盘 CRM、导航、媒体库、草稿发布和版本回滚能力。

## 已确认内容

- 用户要求不中途询问，按推荐方案直接实施并发布。
- 文档中的 15 年、100+ 国家、3,500 m²、500 台每年视为用户确认可公开使用的数据。
- 十张本地图片是本次首页的指定资源，不生成、不重绘、不替换为第三方图片。
- 首页正式内容仍通过 SitePage 的草稿、发布和版本机制生效，代码部署本身不覆盖现有线上首页。

## 采用方案

采用现有 PageBuilder 扩展方案：新增首页专用组件类型和渲染器，新增后台首页管理入口，继续使用 SitePage、PageVersion、MediaAsset、MediaReference 和 Inquiry API。

没有采用独立 HomepageSettings 数据表，因为它会重复页面版本、媒体引用、权限、发布和回滚逻辑。没有采用静态 React 硬编码方案，因为它不能满足后台自由编辑和长期维护要求。

## 页面结构

1. Hero Banner：使用 press brake 图片，左侧英文文案，图片主体不被文字遮挡。
2. About ZYRON：浅冷灰背景，左图右文，显示四组已确认数据，并在进入视口时执行尊重 reduced motion 的数字动画。
3. Our Products：桌面三栏、移动端横向分类导航；点击后同步切换文案、链接和真实设备图片。
4. Why Choose ZYRON：深色双栏，左侧四项优势纵向排列，右侧完整展示指定品牌科技图。
5. News and Insights：支持重点文章和普通文章；只有状态为 published 且具有有效站内详情链接的条目才在正式首页成为可点击文章。当前三篇内容作为草稿保存，避免伪造正文、发布日期或详情页。
6. Contact CTA：深色双栏，复用真实 `/api/inquiry` 和 CRM 存储流程；支持滚动聚焦、字段验证、防重复提交、成功和失败提示。
7. Footer：不复制进 SitePage，后台首页管理入口提供直达现有 Footer 管理的链接。

## 后台体验

- 新增 `/admin/homepage`，有现有 home 页面时直接提供首页设计入口；没有时可从新版首页模板安全创建。
- 侧边栏增加“首页管理”。
- 六个首页模块支持增删、复制、排序、隐藏、响应式样式、文字样式和背景色。
- 单图与列表图片都支持媒体资源库选择；产品和新闻条目继续使用结构化逐项编辑。
- Footer 通过“页脚设置”快捷入口进入现有导航管理，不制造第二份配置。

## 资源与链接

- 产品图片使用 `/images/products/*.webp`。
- 工厂和 Why Choose 图片使用 `/images/about/*.webp`。
- 产品链接使用现有 `/products/series/{slug}` 路由，不创建猜测 URL。
- About 链接使用现有 `/factory`，Contact 链接使用现有 `/contact`，新闻列表使用现有 `/news`。

## 发布与安全

- 新版首页默认文档是显式模板，不在代码部署时自动覆盖现有 SitePage。
- Preview 使用隔离测试数据库验证发布和询盘。
- 生产发布前先完成分支依赖合并、构建和 Preview 验收。
- 生产内容更新使用可审计的幂等脚本：保留现有发布快照为 PageVersion，再写入并发布新版首页，不删除其他页面和数据。
- 生产异常时可恢复上一 SitePage 版本并回滚 Vercel 部署。

## 非目标

- 不重建新闻全文系统，不伪造三篇文章正文或发布日期。
- 不修改其他页面、产品参数、Logo、导航数据、客户询盘或数据库结构。
- 不删除 Banner 管理；它继续服务旧首页兼容路径，但新版首页发布后由 PageBuilder Hero 控制首屏。
