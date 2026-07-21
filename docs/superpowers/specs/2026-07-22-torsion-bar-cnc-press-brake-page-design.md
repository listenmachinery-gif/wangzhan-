# Torsion Bar CNC Press Brake 产品详情页设计规格

## 目标

将 `Torsion Bar CNC Press Brake` 从通用参数详情页升级为“经济型 CNC 板材折弯解决方案”专用页面。在不改变全站导航、页脚、路由体系和品牌变量的前提下，完整承载扭轴同步、CNC 控制、应用、工艺、选型、参数、FAQ 与询价内容。

## 已确认方向

采用“专用数据文件 + 专用页面组件”方案，仅影响 `/products/torsion-bar-cnc-press-brake`。该方案延续已上线 NC Hydraulic Press Brake 页面的工业设计语言，但为本产品增加独立的扭轴同步、CNC 控制和三类折弯机客观对比内容。

未采用的方案：

- 直接扩展通用 `ProductSolutionPage`：改动较少，但无法清晰承载扭轴同步、控制配置和选型差异。
- 抽象并重构全部 press brake 专用页面：可减少长期重复，但会扩大本次回归面并影响已上线页面。

## 页面结构

页面按以下顺序组成：

1. Hero：指定 H1、副标题、描述、双 CTA 和四项价值标签；右侧使用现有产品主图，不改变机器结构、比例和颜色。
2. 客户痛点：五项标准折弯生产问题与克制的解决说明。
3. 解决方案：General Sheet Metal Workshop、Cabinet & Enclosure Fabrication、Duct, Structure & Machinery Parts 三类生产场景。
4. Applications：八张项目内真实行业照片与简短说明，不使用线条图、SVG 场景图或 AI 生成的伪现场图。
5. Materials：六类材料与影响实际折弯能力的条件说明。
6. From Flat Sheet to Bent Part：从开料到下一工序的六步流程，使用编号、文字和方向性图标表达。
7. Torsion Bar Synchronization：基于现有产品资料解释机械扭轴同步的定位、适用范围和与电液伺服同步的差异。
8. Practical CNC Control：基于现有资料说明 X 轴后挡料、Y 轴/滑块行程、程序步骤和计数能力；控制器型号保持条件语气。
9. Why Choose This Torsion Bar CNC Press Brake：现有主图配合真实结构与优势文字，不创建假细节照片。
10. 客观对比：NC Hydraulic Press Brake、Torsion Bar CNC Press Brake、Electro-hydraulic CNC Press Brake 八个维度的响应式表格。
11. 完整制造工作流：剪切、激光切割、扭轴 CNC 折弯、卷板、液压压制、焊接、表面处理。
12. 选型指南：十四项客户输入清单和 `Request Recommendation` CTA。
13. Technical Specifications：直接读取产品现有 9 列、37 行原始参数。
14. Tooling Matters for Better Bending：说明 punch、die、V-die opening、材料强度与定制模具的关系。
15. FAQ：十个语义化折叠问题。
16. 内部链接：仅链接站内实际存在的产品或系列页面。
17. 底部 CTA：使用指定标题、说明和双按钮。

## 视觉系统

- 沿用 Montserrat/DIN/Eurostile/Arial 字体栈和 `#76B900` 品牌绿色。
- 深色区域使用 `#0B0D10`、`#12161A`、`#171C21` 与低强度工业网格；白色和 `#F4F6F8` 阅读带控制长页节奏。
- 采用开阔分区、细边框、克制阴影、2–4px 小圆角和轻微 hover 上浮，避免促销卡片、胶囊元素、价格和夸张动画。
- Hero 主图放在柔和工业灯光与低平台阴影上，保持原图完整、无滤色覆盖。
- Applications 使用八张真实照片，统一裁切比例；照片只表达行业场景，不冒充本机客户案例。
- 不生成或展示假的机器细节图，不使用线框图替代行业照片。

## 参数表规则

- 权威数据源为产品现有 `technicalParameters`；组件直接读取，不复制或改写数值。
- 现有数据为 9 列、37 行，首型号 `40T/2200`，末型号 `600T/6000`。
- 表头文字标签保持同一行；括号内单位换到下一行并水平居中。
- `Overall DimensionsL x W x H (mm)` 仅在显示层格式化为 `Overall Dimensions L × W × H` 与下一行 `(mm)`，不修改源数据。
- 参数表和对比表在移动端仅自身容器横向滚动，页面根节点不得横向溢出。
- 表格下方显示最终规格取决于材料、厚度、折弯长度、模具、控制器、同步系统和最终配置的说明。

## 数据与真实性边界

- 产品主图、原始参数、扭轴同步结构、液压驱动、CNC 后挡料和已有控制器资料为权威内容。
- TP10、E300P、DA41T、R 轴、补偿方式等仅作为项目资料支持的常见或可选配置，不描述为全部机型标配。
- 不编造吨位、精度、产能、重量、功率、价格、客户案例或增效比例。
- 设备结构区复用完整产品主图和文本说明；没有真实局部照片时不生成假图。
- 行业照片优先复用项目内带来源记录的实拍资源。

## 响应式与交互

- Hero 桌面左右布局，移动端文字在上、产品图在下；CTA 在窄屏全宽。
- 应用网格桌面 4 列、平板 2 列、手机 1 列；其他卡片按内容密度逐级折叠。
- 流程与配套工作流在桌面横向、移动端纵向。
- FAQ 使用原生 `details/summary`，支持键盘与可见焦点；交互尊重 `prefers-reduced-motion`。
- 页面只能有一个 H1，非 Hero 图片默认懒加载。

## SEO 与结构化数据

- Meta title：`Torsion Bar CNC Press Brake | Cost-effective Sheet Metal Bending Solution`。
- Meta description 使用用户指定文案。
- 添加 canonical、Open Graph、Twitter 卡片和用户指定关键词。
- 图片 alt：`Torsion bar CNC press brake for sheet metal bending`。
- 添加不含价格与 offers 的 Product JSON-LD、FAQPage JSON-LD 和 BreadcrumbList JSON-LD。

## 代码边界

- 新建 `data/torsion-bar-cnc-press-brake-page.ts` 保存页面内容、真实照片和类型。
- 新建 `components/TorsionBarCncPressBrakeSolutionPage.tsx` 负责专用页面布局。
- 修改 `app/products/[id]/page.tsx` 增加专用路由与 SEO 分支。
- 新建页面契约脚本，检查路由、SEO、17 个模块、8 张真实图片、9×37 参数引用、表头拆分、结构化数据、唯一 H1、禁止价格与二维码等约束。
- 不新增第三方依赖，不修改导航和页脚，不重构无关产品页。

## 验收标准

- 指定模块、文案、CTA 与内部链接完整；只有一个 H1。
- 八个应用项目全部使用真实照片，不出现线条图或假产品细节图。
- 参数表使用原有全部 9 列、37 行数据；标题不拆词，单位另起一行居中。
- 桌面与手机页面无根级横向溢出；参数表和对比表局部滚动正常。
- Product、FAQPage、BreadcrumbList Schema 可解析且不含价格。
- 桌面和移动端完成浏览器视觉、控制台和 FAQ 交互检查。
- 页面契约、`npm run lint` 与 `npm run build` 全部通过后才能生产部署。
