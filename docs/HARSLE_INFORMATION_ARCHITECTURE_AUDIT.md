# HARSLE 信息架构审计与 ZYRON CMS 映射

审计日期：2026-11-20  
参考范围：`https://www.harsle.com/`、`/company/`、`/products/`、`/shearing-machine/`、`/press-brake/`、`/product/press-brake-with-6-axis/`、`/service/`、`/portfolio/`、`/contact/`

本文件只记录可复用的信息架构、层级、节奏和交互模式。HARSLE 的商标、图片、代码、产品命名、独特文案、统计数字、认证和服务承诺均不进入 ZYRON 模板。

## 逐页结构

| 页面 | 参考站主要模块顺序 | 视觉与交互特征 | ZYRON CMS 映射 |
| --- | --- | --- | --- |
| Home | 全屏主视觉 → 公司简介与数字 → 产品系列 → 选择理由/FAQ → 内容入口 → 服务入口 → Footer | 深色主视觉、大标题、绿色 CTA；产品以大图与短说明建立第一层选择；桌面横向分栏，移动端单列 | `HERO`、`SPLIT_FEATURE`、动态产品目录、`ADVANTAGES`、`FAQ`、`RESOURCE_LINKS`、`INQUIRY_CTA` |
| Company | 公司主视觉 → 实力数字 → 公司介绍 → 愿景/价值 → 制造技术 → 历程 → 团队 → 案例 → 证书 → CTA | 长页面章节清晰交替；数字区强化信任；时间轴和团队卡片在窄屏降为单列 | `HERO`、`FACTORY_STATS`、`SPLIT_FEATURE`、`TIMELINE`、`CUSTOMER_CASES`、`CERTIFICATES`、`INQUIRY_CTA` |
| Products | 产品系列总入口 → 每系列大图、名称、查看详情与报价 → Footer | 产品入口是核心，不把完整规格堆在索引页；桌面多列/大卡，移动端纵向浏览 | CMS Hero + 数据库 `ProductCategory` 动态目录 + 可编辑前后插槽 |
| Series | 锚点导航 → 系列 Hero → 基础解释/选型参数 → 子产品 → 优势 → 行业应用 → 选型指南 → 客户/FAQ → 报价 | 页面内锚点固定产品选择路径；型号卡强调差异；FAQ 和报价收口 | 系列 slug 绑定数据库分类；`BEFORE_LEGACY` / `AFTER_LEGACY` 插槽；`MODEL_COMPARISON`、`APPLICATIONS`、`FAQ`、真实询盘 |
| Product detail | 产品标题/图 → 产品说明 → 结构/功能细节 → 参数/型号 → 应用 → 相关内容 → 报价 | 详情信息按购买决策顺序展开；参数表横向滚动；图文模块可重复 | 保留现有专用 React 详情、真实图库/规格/SEO；CMS 节点支持旧版前、替换旧版、旧版后，且同类型可重复 |
| Support | 服务主视觉 → 服务类型 → 联系入口 → 服务流程 → FAQ | 任务导向而非纯宣传；支持入口、流程和 FAQ 分层；移动端采用单列卡片 | `RESOURCE_LINKS`、`TIMELINE`、`FAQ`、`INQUIRY_FORM`；所有承诺由管理员使用已核实资料填写 |
| Showcase | 发货/案例筛选 → 图片网格 → 详情/放大 → 分页或加载更多 | 以真实设备和国家/场景为主，文字较短；移动端网格降列 | 复用动态 Shipping Highlights、Cases；CMS 负责 Hero、说明和 CTA，不复制静态假案例 |
| Contact | 简洁 Hero → 单一报价表单 → 邮箱/即时通信/地址 → 地图/辅助入口 | 表单与联系资料并列；窄屏表单在前、联系资料在后；避免多个竞争表单 | 复用 `/api/inquiry`、反垃圾和分析；`INQUIRY_FORM` 只能渲染一个有效表单；页脚和联系资料由后台维护 |

## 全站导航映射

- 一级导航固定以后台快照为单一数据源：Home / Company / Products / Support / Showcase / Contact。
- Products 使用数据库发布分类和产品生成 Mega Menu；后台只控制入口名称、顺序、显隐和层级，不复制产品目录数据。
- 普通导航支持三级；桌面同时支持 hover 与 `focus-within`，移动端采用对话框抽屉与原生折叠项。
- 移动抽屉支持关闭按钮、遮罩关闭、Esc、打开/关闭焦点回归和 44px 触控目标。
- Footer 的分组、品牌说明、邮箱、WhatsApp、地址、CTA 和版权均存入 `NavigationSnapshot`，旧快照缺少字段时使用兼容回退。

## ZYRON 视觉规则

- Header `#0B0D10`，品牌绿 `#76B900`，正文 `#1D1D1F`，浅灰 `#F5F5F7`，白色 `#FFFFFF`。
- 内容最大宽度 1440px；信息密集区保留 24–40px 栅格间距，章节垂直留白 64–96px。
- 机械图片优先自然比例和 `contain`；场景图片使用 `cover`，必须有真实 alt。
- 标题、正文和 CTA 保持清楚的三级层次；不得把未经核实的数字、认证、交付时限、保修期或客户评价写入默认模板。
- 预览与发布共享 `PageRenderer`；响应式差异来自同一份验证后的 `PageStyle`，不另建一套预览 DOM。

## 本分支实施差异

1. Page Builder 增加路由插槽字段，旧文档默认落在旧版内容之后，避免改变已发布页面。
2. 产品详情可选择在专用详情前插入、完全接管或在详情后追加 CMS 模块。
3. `ProductSection` 允许同类型重复，仍以产品内唯一 position 保证顺序。
4. 产品/系列页面发布时将 CMS slug 映射到真实公开 URL 并同时刷新产品中心。
5. 后台导航支持三级编辑；公开导航补齐键盘焦点与移动抽屉行为。
6. Footer 的品牌、联系信息、产品分类标题与显隐、合作入口、资讯 CTA、法律链接均进入导航版本快照，可随草稿、发布和回滚一起管理；无真实接口的订阅输入框已移除。
7. 产品编辑器可直接进入独立页面设计器；采用“完全接管”时，所有 CMS 模块按后台顺序替换旧版正文，未转换产品继续使用原有专用详情作为安全回退。
8. 支持中心在已发布 CMS 文档为空时自动回退完整模板，避免发布空内容造成前台空白。

## 本地验收记录

2026-11-20 在隔离的 `zyron_cms_test` 数据库完成非破坏性迁移核对，14 个迁移全部已应用，无待执行迁移。

- 公开页面矩阵：Home、Company、Products、Series、Product Detail、Support、Showcase、Contact，分别在 1440、1024、768、390 像素宽度验证成功，无横向溢出。
- 交互与内容：移动导航焦点恢复、超长产品标题换行、空 CMS 支持页回退、真实询盘写入测试数据库、Contact 与产品详情 canonical 均验证成功。
- 公开询盘：修复可选电话/WhatsApp 留空时被误判为非法的问题；不填写电话也可正常提交并产生 CRM 询盘。
- 视觉证据：32 张全页截图保存在 Git 忽略目录 `.playwright/screenshots/harsle-cms/`，不进入仓库和部署包。
- 公开页面专项验收：38 项（含移除首页无效订阅表单）全部通过后方可进入 Preview。

## 待内容团队确认

- 所有统计数字、认证、工厂面积、出口国家、客户评价、保修与响应时间。
- Contact 页展示的最终地址、即时通信号码和地图链接。
- 每个产品模板采用“保留专用详情并插入 CMS”还是“CMS 完全接管”。
- Showcase 中可公开的客户图片、国家和项目说明。
