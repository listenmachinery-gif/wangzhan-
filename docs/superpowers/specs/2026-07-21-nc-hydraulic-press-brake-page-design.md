# NC Hydraulic Press Brake 产品详情页设计规格

## 目标

将 `NC Hydraulic Press Brake` 从通用产品详情页升级为“经济型板材折弯解决方案”专用页面，在不改变全站导航、页脚、路由体系和品牌视觉变量的前提下，完整承载选型、应用、控制、工艺、参数、FAQ 与询价内容。

## 已确认方向

采用“专用数据文件 + 专用页面组件”方案。它能复用现有 Next.js、React、Tailwind、站点导航和页脚，同时避免把大量 NC 折弯机专属字段塞入通用产品模板。页面仅影响 `/products/nc-hydraulic-press-brake`。

未采用的方案：

- 直接扩展通用 `ProductSolutionPage`：改动最少，但会让通用模型承担大量只属于 NC 折弯机的内容和布局。
- 重构所有折弯机产品页：长期一致性更高，但超出本次单页改版范围，增加回归风险。

## 页面结构

按以下顺序组成长页：

1. Hero：左侧标题、说明、双 CTA 和四项价值标签；右侧使用现有 NC Hydraulic Press Brake 主图，不改变机器结构、比例和颜色。
2. 客户痛点：五项真实生产问题与对应解决方向。
3. 解决方案：General Sheet Metal Workshop、Cabinet & Enclosure Fabrication、Duct, Structure & Machinery Parts 三类方案。
4. 适用行业：八张真实行业场景照片与简短说明，不使用线条图、SVG 场景图或 AI 伪细节图。
5. 材料：Mild Steel、Stainless Steel、Galvanized Sheet、Aluminum Plate、Copper Sheet、Thin Metal Plate。
6. 折弯流程：Sheet Cutting 至 Next Process 的六步横向流程，移动端纵向排列。
7. NC 控制：基于项目现有资料说明 E21、X/Y 轴相关控制、程序步骤和计数能力，同时声明最终控制器以配置为准。
8. 机器优势：使用现有产品主图与真实结构文字，不创建虚假细节照片。
9. 客观对比：NC Press Brake、CNC Press Brake、Hydraulic Folding Machine 七个维度的响应式对比表。
10. 配套工作流：剪切、激光切割、NC 折弯、卷板、液压压制、焊接、表面处理。
11. 选型指南：客户需提供的信息清单 + `Request Recommendation` CTA。
12. 技术参数：使用 `bending-details.ts` 中 `simple-nc-press-brake` 的原有 9 列、全部行与全部数值。
13. 模具与折弯能力：说明 punch、die、V-die opening、材料强度与定制模具的关系，不增加未经验证的吨位公式。
14. FAQ：九个问题的原生折叠组件。
15. 底部 CTA：询价和工程师联系入口。

## 视觉系统

- 沿用全站 Montserrat/DIN/Eurostile/Arial 字体栈和 `#76B900` 品牌绿色。
- 主色为 `#0B0D10`、深钛灰渐变、白色和浅灰；白底/浅灰段落用于控制长页阅读节奏。
- 卡片仅使用细边框、低强度阴影和轻微 hover 上浮，避免电商促销感、过度圆角与图标堆叠。
- Hero 产品图放置于工业灯光与玻璃/金属展台感容器中；不修改产品本体。
- 行业图片优先复用项目内现有实拍资源，并为每张图提供准确英文 alt。
- 不显示价格、二维码、微信、虚假产能、虚假精度或虚假产品细节。

## 参数表规则

- 数据源只读取产品现有 `technicalParameters`，不得复制后改写数值。
- 表头每一列的文字标题保持在同一行；括号内单位单独换到下一行并水平居中。
- 对 `Overall DimensionsL x W x H (mm)` 仅做显示层格式修正为 `Overall Dimensions L × W × H` + `(mm)`，原始数据源不改。
- 桌面端表格保持完整列宽；移动端容器横向滚动，不能挤压、裁切或强制标题逐词换行。
- 表格下方显示最终规格取决于材料、厚度、折弯长度、模具、控制器和机器配置的提示。

## 内容与数据边界

- 原有真实参数、主图、产品名称和已有 E21/扭轴同步描述为权威数据。
- 真实结构内容限于项目现有资料支持的液压驱动、上/下模、后挡料、扭轴同步和基础 NC 控制。
- 对机械补偿、控制器型号、轴配置等可选项使用条件语气，不将选配描述为全部机型标配。
- 适用行业照片只表达场景，不冒充本机实际客户案例或本机细节图。

## 响应式与交互

- Hero 桌面左右布局，移动端文字在上、产品图在下；CTA 在窄屏全宽。
- 卡片网格在平板和手机逐级降为双列/单列。
- 流程和配套工作流在桌面横向、移动端纵向。
- 参数表与对比表在移动端横向滚动，表头保持可读。
- FAQ 使用语义化 `details/summary`，键盘可操作；所有交互尊重 `prefers-reduced-motion`。
- 页面只保留一个 H1。

## SEO 与结构化数据

- Meta title：`NC Hydraulic Press Brake | Sheet Metal Bending Solution`。
- Meta description 使用用户指定文案。
- 添加 canonical、Open Graph、Twitter 卡片与关键词集合。
- 添加无价格、无 offers 的 Product JSON-LD、FAQPage JSON-LD 和 BreadcrumbList JSON-LD。
- 内链指向站内已有 CNC press brake、剪板机、激光切割机、卷板机、液压机与折弯机系列；不存在的 tooling 页面不创建假链接。

## 代码边界

- 新建 `data/nc-hydraulic-press-brake-page.ts` 保存页面内容与类型。
- 新建 `components/NcHydraulicPressBrakeSolutionPage.tsx` 负责专用页面布局。
- 修改 `app/products/[id]/page.tsx` 增加专用路由选择与 SEO 元数据。
- 新建专用页面契约验证脚本，覆盖模块、真实图片、参数数据引用、表头拆分、结构化数据和响应式标记。
- 不新增第三方依赖，不修改全站导航和页脚，不重构无关页面。

## 验收标准

- 页面模块、文案和 CTA 完整；只有一个 H1。
- 八个适用行业项目均展示真实照片，不出现线条图。
- 参数表使用原有全部参数行；表头标题单行，单位下一行居中。
- 桌面与手机布局均无横向页面溢出；仅参数表和对比表可在自身容器内滚动。
- 图片使用 Next.js Image 或原生懒加载策略，Hero 主图优先加载，其余图片懒加载。
- FAQ/Product/Breadcrumb Schema 可解析且不包含价格。
- `npm run lint`、页面契约测试和 `npm run build` 全部通过。
- 本地浏览器完成桌面与手机视觉检查后再生产部署。
