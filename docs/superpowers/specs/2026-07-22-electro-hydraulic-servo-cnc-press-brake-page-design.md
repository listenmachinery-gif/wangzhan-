# Electro-Hydraulic Servo CNC Press Brake 产品详情页设计规格

## 目标

将 `Electro-Hydraulic Servo CNC Press Brake` 从通用参数详情页升级为“高精度 CNC 板材折弯生产解决方案”专用页面。在不改变全站导航、页脚、路由体系和品牌变量的前提下，完整承载精密折弯场景、电液同步、CNC 控制、多轴后挡料、补偿与模具、原始参数、FAQ 与询价内容。

用户此前已明确授权按推荐方向直接生成和完成，因此本次不设置额外设计确认停顿；本文件记录采用的设计与真实性边界。

## 方案选择

采用“专用数据文件 + 专用页面组件”方案，仅影响 `/products/electro-hydraulic-servo-cnc-press-brake`。该方案延续已上线 NC Hydraulic Press Brake 与 Hydraulic Folding Machine 页面的工业设计语言，同时为本产品增加独立的电液伺服同步、CNC 控制、多轴后挡料、补偿与模具说明。

未采用的方案：

- 扩展 NC Hydraulic Press Brake 专用组件：表面复用较多，但会把经济型 NC 与高精度伺服 CNC 两套不同产品叙事混在同一组件中。
- 立即抽象全部 Press Brake 页面为共享页面引擎：可减少长期重复，但会扩大本次修改与回归范围，并影响正在推进的扭轴 CNC 页面。

## 页面结构

页面按以下顺序组成：

1. Hero：指定 H1、副标题、描述、双 CTA 和四项价值标签；右侧仅使用项目现有完整产品主图，不改变机器结构、比例和颜色。
2. 客户痛点：五项精度、换单、长工件一致性、多轴定位和设备升级问题，以克制的解决说明呈现。
3. 解决方案：Precision Sheet Metal Fabrication、Cabinet & Electrical Enclosure Manufacturing、Machinery, Structure & Stainless Steel Products 三类生产场景。
4. Applications：九张真实行业照片，覆盖精密钣金、机箱机柜、不锈钢、风管、机械、钢结构、汽车零部件、金属家具与一般金工车间；不使用线条图、SVG 场景图或 AI 伪现场图。
5. Materials：Mild Steel、Stainless Steel、Galvanized Sheet、Aluminum Plate、Copper Sheet、Brass Sheet、Thin Metal Plate 七类材料与选型限制说明。
6. From Flat Sheet to Precision Bent Part：开料、模具选择、程序设置、后挡料定位、伺服液压折弯、角度检查、下一工序七步流程。
7. Electro-Hydraulic Servo Synchronization：基于现有资料解释 Y1/Y2、比例伺服控制、液压缸和光栅反馈的闭环同步价值。
8. Advanced CNC Control for Complex Bending：说明多步程序、后挡料位置、滑块行程、补偿和图形编程能力；控制器品牌与功能保持常见/可选语气。
9. Multi-axis Back Gauge for Accurate Positioning：说明 X、R、Z1/Z2、滚珠丝杆、直线导轨与伺服驱动的配置逻辑，不把可选轴数描述为全系标配。
10. Crowning and Tooling Matter：解释长工件挠度、补偿系统、上模/下模、V 槽开口和特殊模具，并提供 `Send Drawing for Tooling Recommendation` CTA。
11. Why Choose This Electro-Hydraulic Servo CNC Press Brake：复用完整产品主图配合真实结构与优势文字，不创建假细节照片。
12. 客观对比：NC Hydraulic Press Brake、Torsion Bar CNC Press Brake、Electro-Hydraulic Servo CNC Press Brake 八个维度的响应式表格。
13. Build a Complete Sheet Metal Fabrication Workflow：激光切割、剪切、伺服 CNC 折弯、卷板、液压压制、焊接、表面处理、自动化八个环节。
14. 选型指南：材料、厚度、折弯长度、角度、最小翻边、产量、零件复杂度、吨位、精度、轴数、控制器、图形编程、模具、补偿、电压、夹具及前后工序匹配等客户输入。
15. Technical Specifications：直接读取现有 16 列、26 行原始参数。
16. FAQ：十二个语义化折叠问题。
17. 内部链接：只链接站内实际存在的 NC、扭轴 CNC、剪板、激光切割、卷板、液压机和折弯机系列页面。
18. 底部 CTA：使用指定标题、说明和双按钮。

## 视觉系统

- 沿用全站 Montserrat/DIN/Eurostile/Arial 字体栈与品牌绿色 `#76B900`。
- 深色区域使用 `#0B0D10`、`#12161A`、`#171C21` 与低强度工业网格；白色和 `#F4F6F8` 阅读带控制长页节奏。
- 采用开阔分区、细边框、2–4px 小圆角、克制阴影和轻微 hover 上浮；不使用促销卡片、价格、二维码、胶囊标签或夸张动画。
- Hero 主图放在深钛灰展台与柔和工业光效中，原图不增加滤色覆盖，不生成假的局部结构图。
- Applications 使用九张真实照片，统一 16:9 裁切；照片仅代表行业场景，不冒充实际客户案例或本机细节图。
- 不使用线条图替代应用照片。流程、配置说明与方向性关系可以使用代码原生图标和排版表达。

## 参数表规则

- 权威数据源为 `data/bending-details.ts` 中本产品现有 `technicalParameters`；组件直接读取，不复制或改写数值。
- 原始数据为 16 列、26 行，首型号 `50T1600`，末型号 `320T6000`。
- 表头文字部分保持完整且不拆词；括号内单位提取到下一行并水平居中。
- 单位只在显示层处理；数据源保持原样，正文参数值不重复附加表头已有单位。
- 参数表和对比表在移动端仅自身容器横向滚动，页面根节点不得横向溢出。
- 表格下方显示最终规格取决于材料、厚度、折弯长度、模具、控制器、后挡料轴、补偿系统和最终配置的说明。

## 数据与真实性边界

- 产品主图、16×26 原始参数、Y1/Y2 闭环同步、CNC 系统、比例伺服阀、液压缸、光栅反馈以及现有优势文案为权威内容。
- Delem、ESA、Cybelec、DA53T、DA58T、DA66T、DA69T、4+1 轴、6+1 轴、X/R/Z1/Z2、补偿和快速夹具等仅作为项目资料支持的常见或可选配置，不描述为全部机型标配。
- 不编造精度、产能、周期、节能比例、客户案例、价格或增效百分比。
- 没有真实局部照片时仅复用完整产品主图与文字说明，不生成假产品细节图。
- 行业照片使用有来源记录的实拍资源，只表达生产场景。

## 响应式与交互

- Hero 桌面左右布局，移动端文字在上、产品图在下；CTA 在窄屏全宽。
- 应用网格桌面三列、平板两列、手机一列；其他卡片按内容密度逐级折叠。
- 流程与配套工作流桌面横向、移动端纵向。
- 参数表和对比表使用独立横向滚动容器，标题和说明不随表格滚动。
- FAQ 使用原生 `details/summary`，支持键盘和可见焦点；交互尊重 `prefers-reduced-motion`。
- 页面只能有一个 H1；Hero 主图优先加载，非首屏真实照片懒加载。

## SEO 与结构化数据

- Meta title：`Electro-Hydraulic Servo CNC Press Brake | Precision Sheet Metal Bending Solution`。
- Meta description 使用用户指定文案。
- 添加 canonical、Open Graph、Twitter 卡片及十个指定关键词。
- 图片 alt：`Electro-hydraulic servo CNC press brake for precision sheet metal bending`。
- 添加不含价格与 offers 的 ProductModel、FAQPage 和 BreadcrumbList JSON-LD。
- 内链只指向 `data/products.ts` 中真实存在的路由；不创建不存在的 tooling 或 automation 页面。

## 代码边界

- 新建 `data/electro-hydraulic-servo-cnc-press-brake-page.ts` 保存页面内容、真实照片和类型。
- 新建 `components/ElectroHydraulicServoCncPressBrakeSolutionPage.tsx` 负责专用页面布局。
- 修改 `app/products/[id]/page.tsx` 增加专用路由选择与 SEO 分支。
- 新建页面契约脚本，检查路由、SEO、18 个模块、九张真实应用图片、16×26 参数引用、表头拆分、结构化数据、唯一 H1 和禁止价格/二维码等约束。
- 不新增第三方依赖，不修改全站导航和页脚，不重构无关产品页。

## 测试与验收

- 先建立失败的专用页面契约测试，再新增数据、图片、组件和路由直至契约通过。
- 指定模块、文案、CTA 与内部链接完整；页面只有一个 H1。
- 九个应用项目全部展示真实照片，不出现线条图或假产品细节图。
- 参数表直接使用原有全部 16 列、26 行；标题不拆词，单位另起一行居中。
- 桌面、1280px 与 390px 手机页面无根级横向溢出；参数表和对比表局部滚动正常。
- FAQ、ProductModel、BreadcrumbList Schema 可解析且不包含价格。
- 使用应用内浏览器完成桌面、移动端、图片、FAQ、参数表和控制台检查。
- 所有 `scripts/verify-*.mjs`、`npm run lint`、`npx tsc --noEmit` 与 `npm run build` 全部通过后交付；是否部署按当前用户请求范围处理。
