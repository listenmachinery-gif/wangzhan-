# Codex execution brief — ZYRON HARSLE-inspired site and editable CMS

目标仓库：listenmachinery-gif/wangzhan-
当前工作分支：feat/harsle-inspired-page-sections-20261120
参考：https://www.harsle.com/
设计原则：参考信息架构、排版节奏、模块组成与交互层级；不得复制其图片、商标、代码和独特文案。品牌继续使用 ZYRON，并保持产品数据、SEO、询盘系统。

## 先执行
1. 检出当前工作分支，阅读 README.md、prisma/schema.prisma、lib/page-builder/*、components/page-builder/*、components/admin/pages/PageBuilder.tsx、lib/navigation/*、components/SiteHeader.tsx、app/(site)/*。
2. npm ci；npm run typecheck；npm run lint；npm test；npm run build。记录并修正编译、类型、构建错误，不要忽略失败。
3. 检查当前分支所有变更，复核模板的字段、所有链接、图片实际存在性、Schema 合法性及 admin 页面可访问权限。
4. 使用浏览器分别检查 1440 / 1024 / 768 / 390 宽度，截屏比较设计，不要直接上线生产。

## 已在本分支初步完成
- 新增工业站八类页面模板（首页、公司、产品中心、产品系列、单品详情、支持、展示、联系）。
- 四种模块 SPLIT_FEATURE、TIMELINE、RESOURCE_LINKS、INQUIRY_FORM，以及编辑器文字颜色、字号、字重、字体、行高、字距、对齐控制。
- 现有页面编辑器可给已存在页面应用模板，保留版本机制。
- 添加 /support 和 /showcase，前台产品中心、产品系列、产品详情、公司、联系页支持追加已发布 CMS 内容；首页、公司、联系页发布带 HERO 的完整模板后可接管布局。
- 保留现有 API inquiry 路径与埋点。

## 必须继续完成（不要只汇报）
### A. 对参考站逐页审计
检查 HARSLE Home, Company, Products, Shearing Machine series, real product detail, Support, Showcase, Contact。列出每页模块顺序、视觉布局、文本层级、交互方式、桌面/移动差异，并在 docs 中输出映射表。网站视觉借鉴而非复制。

### B. 公共导航 / Footer
- 调整 SiteHeader 为可键盘操作、聚焦可见的多级导航，支持 products mega-menu、support、showcase、contact、quote CTA。
- 绑定现有 NavigationSnapshot 管理后端。已发布导航优先，默认导航作为 fallback；提供可视化后台编辑二三级菜单。
- 移动端用清晰的抽屉或折叠面板，关闭、Esc、焦点管理和触控目标测试。
- Footer 的分组、链接、版权和品牌文案通过后台编辑；不得破坏已有导航数据。

### C. 页面模块及可编辑性
- 在已有 page-builder Schema / registry / editor / frontend renderer 上迭代，不要重建 CMS。
- 每个模块有独立标题、正文、图片/视频、alt、链接、背景色、文字色、字号、字体、字重、行高、字距、对齐、边距、最大宽度，以及桌面/平板/手机配置。
- 文本各元素可单独编辑（眉题、h1/h2、正文、按钮），而不仅仅是整个父区块统一字号；提供真实颜色选择器并允许有效 HEX。
- 支持新增、复制、删除、隐藏、排序、拖动、模块模板插入、预览、撤销/重做、草稿、发布、历史、回滚。
- 每种模块可多次插入，不能被 ProductSection 的 @@unique([productId,type]) 阻断。设计兼容迁移方案，处理现有位置索引和 ProductSection 数据。
- 删除模块是软删除或至少由历史版本恢复。数据校验、链接协议校验、防 XSS。
- 现在的模板数据只能作示例：校对所有图片路径是否存在，证书、客户数、出口国家、保修年限、性能数据都必须经过核实，不得编造。

### D. 模块清单及模板
补齐：Hero Banner（图/视频、CTA、移动裁切）、带面包屑 PageHero、四类卡片栅格、左右图文、数字展示、产品动态列表、产品系列对比、结构细节、应用场景、技术规格响应式表格、FAQ、工厂视频、发展历程、客户案例、证书、新闻、发货记录、下载文档、技术支持入口、搜索、真实询盘表单、联系地址，以及相关产品。
支持产品类别与动态数据绑定，不将动态目录复制成静态模板假数据。
模板分别覆盖 Home、Company、Products、Series、Detail、Support、Showcase、Contact。

### E. 页面接入 / 单一数据源
- Home /: 完整 CMS 文档优先，旧版保留兼容。
- Company /factory: 完整 CMS 优先，旧版兼容。
- Products /products: CMS 模块能插在动态产品目录前、中、后；不要只是在旧页最底部附加，也不要丢失动态产品分类。
- Series /products/series/[id]: 以数据库分类为数据源，模块插槽可编辑并按 category slug 关联。
- Product /products/[id]: 现有每个产品专属 React 详情模板、真实规格、图库、SEO、追踪仍可工作；实现每个产品内部模块任意插槽与排序，不只在文末加额外模块。做到所有现有详情页可后台修改、模块增减，且兼容历史结构。
- Support /support、Showcase /showcase：与后台模板相接并优先呈现真实动态内容。
- Contact /contact：只有一个有效的询盘表单，保持 API /api/inquiry、反垃圾、埋点和错误处理，不造假按钮。
- 发布必须与正确前台路径一一映射并刷新相关缓存；避免“后台发布成功，前台仍是旧页面”的问题。
- 页面 slug、canonical、meta、sitemap、OG 和 SEO 结构化数据不回退。

### F. 视觉标准
品牌保持深色 #0B0D10、品牌绿 #76B900、白色 #FFFFFF；大留白、清晰网格、机械实拍，不用 HARSLE 图。
设计以 1440 内容宽为上限，容器自适应；标题 Desktop 40–64px、Tablet 32–48px、Mobile 28–38px；正文 16–18px、行高 1.5–1.8。所有数值后台可调整。
CTA 清晰但不过度；图片自然比例、无横向溢出，适配键盘与降低动态效果偏好。
确保预览与发布 DOM/CSS 一致，避免 !important 污染页面其它区域。

### G. 数据库、安全和验收
- 在 Prisma 上做非破坏性迁移；现有 SitePage/PageVersion、Product/ProductSection、MediaAsset、NavigationSnapshot 数据不得丢失。
- 新增单元和集成测试：模板 documentSchema 验证、重复模块、编辑/保存/发布/回滚、产品插槽渲染、导航手机端、询盘表单、SEO 和缓存失效。
- 使用 Playwright 测试 8 页模板和 3 个设备宽度，并验证空内容和极长标题。
- 输出改动文件清单、迁移说明、测试结果、预览截图、待确认文案/素材、线上切换与回滚步骤。
- 如有环境限制，明确标明未执行的验证；不得声称已经部署或构建通过。

## 交付
在独立功能分支提交代码并发起 PR；先预览环境验证，再人工确认合并主分支。禁止未经确认直接改生产数据库或部署。
