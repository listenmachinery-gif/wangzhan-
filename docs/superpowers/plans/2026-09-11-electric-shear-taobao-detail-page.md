# 电动剪板机淘宝详情页实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用用户提供的真实设备照片，制作 12 张 750 × 1200 px 高端淘宝详情图、一张 750 × 14400 px 完整长图，以及可编辑的 HTML/CSS 源文件。

**Architecture:** 将交付物隔离在 `artifacts/electric-shear-taobao/`，原始选片、精修产品资产、网页源文件和最终导出分别存放。页面使用静态 HTML/CSS 和少量原生 JavaScript 生成 12 个固定画布；独立 Node 渲染脚本调用本机 Chrome 截图，再使用仓库已有的 `sharp` 生成 JPG 和拼接长图。验证脚本同时检查文案、禁用词、资产完整性、页面数量和输出尺寸。

**Tech Stack:** HTML5、CSS3、原生 JavaScript、Node.js ESM、Google Chrome headless、Sharp、内置 ImageGen 图像编辑工具。

**Spec:** `docs/superpowers/specs/2026-09-11-electric-shear-taobao-detail-page-design.md`

## Global Constraints

- 每张独立页面必须为 750 × 1200 px，共 12 张；完整长图必须为 750 × 14400 px。
- 删除“禾塘机械制造”文字、图形标识和联系电话，不添加其他品牌或联系方式。
- 保留机器原有结构、比例、功能部件和必要安全警示标识，不新增或虚构机械结构。
- 第 7 页只表现手动后挡料，不出现数字显示屏、数控、伺服或自动定位描述。
- 页面不出现人物、价格、库存、促销爆炸贴、大量图标或复杂厂房背景。
- 禁止使用“超强动力”“顶级配置”“行业领先”“至尊品质”“震撼性能”“零耗电”“绝对节能”等承诺。
- 材料页面不做跨材料统一厚度承诺；非金属材料必须提示结合材料特性、厚度和试样结果确认。
- 中文文案由 HTML/CSS 排版，不让图像模型生成中文正文。
- 最终资产必须保存在工作区，不得只保留在 `$CODEX_HOME/generated_images/`。

---

## 文件结构

```text
artifacts/electric-shear-taobao/
├── README.md                         # 打开、编辑、渲染和交付说明
├── source/                           # 从桌面原图复制的入选照片
│   ├── hero-front.jpg
│   ├── frame-rear.jpg
│   ├── pressure-blade.jpg
│   ├── feed-balls.jpg
│   ├── drive.jpg
│   ├── backgauge.jpg
│   └── foot-pedal.jpg
├── assets/                           # 通过 ImageGen 精修后并经过人工验证的视觉资产
│   ├── hero-machine-light.png
│   ├── hero-machine-light-alt.png
│   ├── frame-machine-dark.png
│   ├── pressure-light.png
│   ├── blade-dark.png
│   ├── feed-balls-light.png
│   ├── drive-dark.png
│   ├── backgauge-light.png
│   ├── foot-pedal-light.png
│   └── materials-light.png
├── src/
│   ├── index.html                    # 12 页语义结构和全部最终中文文案
│   └── styles.css                    # 固定画布、字体、渐变、摄影层和响应式预览
└── output/
    ├── png/                            # page-01.png 到 page-12.png
    ├── jpg/                            # page-01.jpg 到 page-12.jpg
    ├── electric-shear-taobao-long.png
    └── electric-shear-taobao-long.jpg
scripts/
├── render-electric-shear-taobao.mjs # Chrome 截图、JPG 转换和长图拼接
└── verify-electric-shear-taobao.mjs # 内容、资产和尺寸合同测试
```

---

### Task 1: 建立交付目录和自动化合同测试

**Files:**
- Create: `artifacts/electric-shear-taobao/README.md`
- Create: `scripts/verify-electric-shear-taobao.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: 已确认设计规格和固定输出目录。
- Produces: `npm run verify:taobao-electric-shear`；后续任务通过同一脚本验证页面、资产和导出尺寸。

- [ ] **Step 1: 创建失败的合同测试**

创建 `scripts/verify-electric-shear-taobao.mjs`，使用以下结构检查页面内容和最终输出：

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const root = process.cwd();
const artifact = path.join(root, "artifacts/electric-shear-taobao");
const htmlPath = path.join(artifact, "src/index.html");
const assetDir = path.join(artifact, "assets");
const outputDir = path.join(artifact, "output");
const contentOnly = process.argv.includes("--content");
const assetsOnly = process.argv.includes("--assets");

const requiredTitles = [
  "一台好的电动剪板机，应该怎么选？",
  "先看机身。",
  "先压稳，再下刀。",
  "好刀片，才经得起每天重复剪切。",
  "板材更好送，操作自然更轻松。",
  "动力，不只是够用。",
  "先定尺寸，再重复剪切。",
  "该工作的时候工作。",
  "需要剪的时候，才真正做功。",
  "一台机器，面对更多日常板材。",
  "所以，选剪板机到底看什么？",
  "把复杂的剪切，变成每天简单的工作。",
];

const forbidden = [
  "禾塘机械制造",
  "15295542624",
  "厂家直销",
  "立即抢购",
  "限时优惠",
  "超强动力",
  "顶级配置",
  "行业领先",
  "至尊品质",
  "震撼性能",
  "零耗电",
  "绝对节能",
  "数控后定位",
  "伺服后挡料",
  "输入尺寸，定位交给机器",
];

const requiredAssets = [
  "hero-machine-light.png",
  "hero-machine-light-alt.png",
  "frame-machine-dark.png",
  "pressure-light.png",
  "blade-dark.png",
  "feed-balls-light.png",
  "drive-dark.png",
  "backgauge-light.png",
  "foot-pedal-light.png",
  "materials-light.png",
];

if (!assetsOnly) {
  assert.ok(fs.existsSync(htmlPath), "missing editable HTML source");
  const html = fs.readFileSync(htmlPath, "utf8");
  assert.equal((html.match(/<section\b/g) ?? []).length, 12, "expected 12 detail-page sections");
  for (const title of requiredTitles) assert.ok(html.includes(title), `missing title: ${title}`);
  for (const word of forbidden) assert.ok(!html.includes(word), `forbidden text found: ${word}`);
  assert.ok(html.includes("手动后挡料"), "manual back-gauge wording is required");
  assert.ok(html.includes("试样结果确认"), "material qualification note is required");
}
for (const file of requiredAssets) assert.ok(fs.existsSync(path.join(assetDir, file)), `missing asset: ${file}`);

if (!contentOnly && !assetsOnly) {
  for (let index = 1; index <= 12; index += 1) {
    const suffix = String(index).padStart(2, "0");
    for (const ext of ["png", "jpg"]) {
      const file = path.join(outputDir, ext, `page-${suffix}.${ext}`);
      assert.ok(fs.existsSync(file), `missing output: ${file}`);
      const metadata = await sharp(file).metadata();
      assert.equal(metadata.width, 750, `${file} width`);
      assert.equal(metadata.height, 1200, `${file} height`);
    }
  }
  for (const ext of ["png", "jpg"]) {
    const file = path.join(outputDir, `electric-shear-taobao-long.${ext}`);
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.width, 750, `${file} width`);
    assert.equal(metadata.height, 14400, `${file} height`);
  }
}

console.log(
  assetsOnly ? "asset contract passed" : contentOnly ? "content contract passed" : "all taobao detail outputs passed",
);
```

- [ ] **Step 2: 运行测试并确认它因源文件尚未创建而失败**

Run: `node scripts/verify-electric-shear-taobao.mjs --content`

Expected: FAIL with `missing editable HTML source`.

- [ ] **Step 3: 添加 npm 命令和项目说明**

在 `package.json` 的 `scripts` 中增加：

```json
"render:taobao-electric-shear": "node scripts/render-electric-shear-taobao.mjs",
"verify:taobao-electric-shear": "node scripts/verify-electric-shear-taobao.mjs"
```

在 `artifacts/electric-shear-taobao/README.md` 写明：

```markdown
# 电动剪板机淘宝详情页

- 编辑：修改 `src/index.html` 和 `src/styles.css`
- 预览：用浏览器打开 `src/index.html`
- 导出：`npm run render:taobao-electric-shear`
- 验证：`npm run verify:taobao-electric-shear`
- 独立成品：`output/png/` 与 `output/jpg/`
- 完整长图：`output/electric-shear-taobao-long.png` 与 `.jpg`
```

- [ ] **Step 4: 提交合同测试**

```bash
git add package.json artifacts/electric-shear-taobao/README.md scripts/verify-electric-shear-taobao.mjs
git commit -m "test: define taobao detail page contract"
```

---

### Task 2: 整理实拍选片并生成十张真实产品视觉资产

**Files:**
- Create: `artifacts/electric-shear-taobao/source/hero-front.jpg`
- Create: `artifacts/electric-shear-taobao/source/frame-rear.jpg`
- Create: `artifacts/electric-shear-taobao/source/pressure-blade.jpg`
- Create: `artifacts/electric-shear-taobao/source/feed-balls.jpg`
- Create: `artifacts/electric-shear-taobao/source/drive.jpg`
- Create: `artifacts/electric-shear-taobao/source/backgauge.jpg`
- Create: `artifacts/electric-shear-taobao/source/foot-pedal.jpg`
- Create: `artifacts/electric-shear-taobao/assets/`（十张最终视觉资产，名称见文件结构）

**Interfaces:**
- Consumes: 用户提供的 18 张原始照片；内置 ImageGen 图像编辑工具。
- Produces: 统一命名的十张 PNG，供 `src/index.html` 通过相对路径引用。

- [ ] **Step 1: 复制七张入选原片到交付目录**

按以下一一对应关系复制，不覆盖用户桌面原文件：

```text
微信图片_20260911090424_1683_3.jpg -> source/hero-front.jpg
微信图片_20260911090428_1687_3.jpg -> source/frame-rear.jpg
微信图片_20260911090430_1689_3.jpg -> source/pressure-blade.jpg
微信图片_20260911090434_1693_3.jpg -> source/feed-balls.jpg
微信图片_20260910112446_1651_3.jpg -> source/drive.jpg
微信图片_20260911090429_1688_3.jpg -> source/backgauge.jpg
微信图片_20260911090436_1695_3.jpg -> source/foot-pedal.jpg
```

- [ ] **Step 2: 用内置 ImageGen 编辑完整机器浅色英雄图**

编辑 `source/hero-front.jpg`，保存为 `assets/hero-machine-light.png`。使用以下最终提示词：

```text
Use case: precise-object-edit
Asset type: premium Taobao industrial product hero
Primary request: Replace the factory with a seamless cool-white to light-gray studio background; remove the visible company logo, Chinese company name and phone number from the front fascia; clean dust, stains, small paint defects and distracting cables; keep necessary safety warning labels.
Subject: the exact blue electric sheet-metal shearing machine and its yellow foot pedal from the reference
Composition/framing: show the entire machine and pedal with generous padding, slightly low three-quarter product-camera angle
Lighting/mood: broad soft studio light, restrained highlights, premium industrial catalog mood
Materials/textures: preserve real painted steel grain, tool steel, fasteners, polyurethane pressure heads and rubber cable texture
Constraints: preserve every structural part, proportion, opening, table, pressure head, blade area, control box, foot and pedal shape exactly; add no components; no text; no watermark; subtle contact shadow and extremely faint floor reflection only
Avoid: plastic-smooth surfaces, dramatic glare, factory background, people, props, price graphics
```

逐项对照原片检查上梁、左右立柱、前台、两块白色检修板、控制箱、压料头、送料滚珠和脚踏结构。如有漂移，只做单项纠正迭代。

- [ ] **Step 3: 生成第二张浅色英雄构图和深色机架图**

基于同一英雄图生成 `assets/hero-machine-light-alt.png`（同结构、略低正面偏右构图，供 PAGE 11/12 复用）。编辑 `source/frame-rear.jpg` 生成 `assets/frame-machine-dark.png`：

```text
Use case: precise-object-edit
Asset type: premium industrial structure feature image
Primary request: Replace only the factory environment with a deep titanium-gray studio; clean the exact rear frame, transmission shaft and visible machine surfaces; remove unrelated machines, scooters, floor markings and workshop clutter.
Composition/framing: preserve the full rear machine frame, open structure and feet; leave negative space above-left for copy
Lighting/mood: controlled edge light and soft fill that reveal welded steel thickness without harsh reflections
Constraints: preserve the real frame, shaft, flywheel, rods, covers, weld locations and proportions exactly; no cutaway, no invented internal parts, no text, no watermark
```

- [ ] **Step 4: 生成压料、刀片和送料滚珠资产**

从 `source/pressure-blade.jpg` 生成两张不同裁切与灯光的资产：

- `assets/pressure-light.png`：冷白背景，压料头为主体，允许添加一张平整的无标识薄金属板，但不改变压料机构；
- `assets/blade-dark.png`：深钛灰背景，刀片与刀座为主体，不制造夸张刀锋或火花。

编辑 `source/feed-balls.jpg` 生成 `assets/feed-balls-light.png`：保留真实滚珠数量、位置、紧固件和台面，添加一张平整的无标识薄板覆盖部分滚珠，让剩余滚珠仍清晰可见；不要速度线或手部。

三张资产共同提示约束：

```text
Preserve the exact visible machine components, count, spacing, fasteners, perspective and blue paint texture from the reference. Clean surface dust and suppress glare only. Add no mechanical components, no labels, no logo, no people, no text, no watermark.
```

- [ ] **Step 5: 生成动力、后挡料和脚踏资产**

- 编辑 `source/drive.jpg` 为 `assets/drive-dark.png`：深钛灰环境，完整保留电机、减速机、法兰、螺栓、吊环、接线盒和线管；去灰尘并增强真实铸铁与金属质感。
- 编辑 `source/backgauge.jpg` 为 `assets/backgauge-light.png`：冷白环境，完整保留两根调节杆、挡板、竖杆、滑槽和紧固件；不得添加数字尺、显示器、电机或伺服结构。
- 编辑 `source/foot-pedal.jpg` 为 `assets/foot-pedal-light.png`：冷白地面，保留黄色防护罩、灰色踏板、线缆和磨损细节；轻微清洁但不过度翻新。

- [ ] **Step 6: 生成材料陈列资产**

新生成 `assets/materials-light.png`，不以任何机器照片为结构参考：

```text
Use case: product-mockup
Asset type: premium industrial material sample still life for a Taobao detail page
Primary request: Six thin rectangular material samples—mild steel, brushed stainless steel, galvanized steel, aluminum, copper and blue color-coated steel—arranged as a restrained architectural fan on a cool-white seamless studio surface
Composition/framing: wide horizontal still life, generous negative space above, no grid, no labels
Lighting/mood: soft daylight-balanced studio lighting, premium material library presentation
Materials/textures: realistic thin sheet edges, subtle differences in reflectivity, no exaggerated mirror glare
Constraints: exactly six samples, no text, no logo, no watermark, no hands, no tools, no machine parts
```

- [ ] **Step 7: 进行结构与尺寸验证**

用 `view_image` 逐张检查十张资产，再运行：

```bash
node scripts/verify-electric-shear-taobao.mjs --assets
```

Expected: `asset contract passed`。不得通过放宽结构约束解决图像问题。

- [ ] **Step 8: 提交经验证的源片与视觉资产**

```bash
git add artifacts/electric-shear-taobao/source artifacts/electric-shear-taobao/assets
git commit -m "feat: add electric shear product visuals"
```

---

### Task 3: 实现 12 页可编辑 HTML/CSS 详情页

**Files:**
- Create: `artifacts/electric-shear-taobao/src/index.html`
- Create: `artifacts/electric-shear-taobao/src/styles.css`
- Test: `scripts/verify-electric-shear-taobao.mjs`

**Interfaces:**
- Consumes: 文件结构中列出的十张 `assets/` PNG；固定 750 × 1200 px 画布；设计规格中的最终中文文案。
- Produces: 12 个带 `data-page="01"` 至 `data-page="12"` 的 `<section class="page">`；查询参数 `?page=01` 只显示指定页面。

- [ ] **Step 1: 创建 12 页 HTML 语义结构**

`index.html` 使用以下完整页面结构；正文换行通过 CSS 控制，不在图片中烧录文字：

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=750, initial-scale=1">
  <title>一台好的电动剪板机，应该怎么选？</title>
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <main class="detail-page" aria-label="电动剪板机选购指南">
    <section class="page page--light page--hero" data-page="01">
      <div class="copy"><p class="eyebrow">HOW TO CHOOSE</p><h1>一台好的电动剪板机，应该怎么选？</h1><p class="subtitle">不是参数越多越好。<br>真正重要的，是每一次剪切都稳定、顺手。</p><p class="body-copy">从结构、压料、刀片到定位，每一个细节，都决定着长期使用体验。</p></div>
      <img class="product-visual" src="../assets/hero-machine-light.png" alt="完整电动剪板机">
    </section>
    <section class="page page--dark page--frame" data-page="02">
      <div class="copy"><p class="eyebrow">01 / MACHINE BODY</p><h2>先看机身。</h2><p class="subtitle">机器够稳，剪切才能一直稳。</p><p class="body-copy">剪板机每天都在承受重复冲击。机身结构不扎实，用得越久，问题越容易出现。所以第一步不是看控制器，而是看它有没有一个真正扎实的机身。</p></div>
      <img class="product-visual" src="../assets/frame-machine-dark.png" alt="电动剪板机焊接机架">
    </section>
    <section class="page page--light page--pressure" data-page="03">
      <div class="copy"><p class="eyebrow">02 / HOLD-DOWN</p><h2>先压稳，再下刀。</h2><p class="subtitle">板材不乱跑，剪切自然更稳定。</p><p class="body-copy">真正影响剪切效果的，不只是刀片。如果板材在下刀的一瞬间发生移动，再好的刀片也很难保证一致性。压稳板材，才是一次稳定剪切真正的开始。</p></div>
      <img class="product-visual" src="../assets/pressure-light.png" alt="聚氨酯压料装置">
    </section>
    <section class="page page--dark page--blade" data-page="04">
      <div class="copy"><p class="eyebrow">03 / BLADE</p><h2>好刀片，才经得起每天重复剪切。</h2><p class="subtitle">锋利只是开始，耐用才是长期价值。</p><p class="body-copy">每天剪、反复剪，依然保持稳定状态，考验的是刀片的耐磨性和加工质量。高合金工具钢刀片经过合理加工与热处理，并可多面使用，提高实际利用率。</p></div>
      <img class="product-visual" src="../assets/blade-dark.png" alt="高合金工具钢刀片">
    </section>
    <section class="page page--light page--feed" data-page="05">
      <div class="copy"><p class="eyebrow">04 / FEEDING</p><h2>板材更好送，操作自然更轻松。</h2><p class="subtitle">不是增加复杂结构，而是减少每一次多余用力。</p><p class="body-copy">每天加工几十张、几百张板材时，一点点阻力，最后都会变成操作人员的负担。送料滚珠减少板材与工作台之间的摩擦，让重复加工少一点费力。</p></div>
      <img class="product-visual" src="../assets/feed-balls-light.png" alt="送料滚珠工作台">
    </section>
    <section class="page page--dark page--drive" data-page="06">
      <div class="copy"><p class="eyebrow">05 / DRIVE</p><h2>动力，不只是够用。</h2><p class="subtitle">更重要的是稳定地把每一次剪切完成。</p><p class="body-copy">启动稳定，运行平顺，该剪的时候有力，长期工作少折腾，才是生产设备需要的动力。铜芯电机与减速机合理匹配，通过成熟机械传动稳定输出。</p></div>
      <img class="product-visual" src="../assets/drive-dark.png" alt="电机与减速机">
    </section>
    <section class="page page--light page--gauge" data-page="07">
      <div class="copy"><p class="eyebrow">06 / BACK GAUGE</p><h2>先定尺寸，再重复剪切。</h2><p class="subtitle">少一点反复测量，多一点加工效率。</p><p class="body-copy">通过手动后挡料调好尺寸后，板材向后送料并靠到挡料位置，即可进行同尺寸的重复剪切，不必每一张都重新测量。</p></div>
      <img class="product-visual" src="../assets/backgauge-light.png" alt="手动后挡料结构">
    </section>
    <section class="page page--light page--operation" data-page="08">
      <div class="copy"><p class="eyebrow">07 / OPERATION</p><h2>该工作的时候工作。</h2><p class="subtitle">简单直接，专注把剪切这件事做好。</p><p class="body-copy">板材送到剪切位置，踩下脚踏，完成一次剪切；松开后，准备下一次送料。没有复杂的操作流程，让日常加工更加直接。</p></div>
      <img class="product-visual machine-layer" src="../assets/hero-machine-light.png" alt="脚踏控制电动剪板机"><img class="product-visual pedal-layer" src="../assets/foot-pedal-light.png" alt="黄色脚踏开关">
    </section>
    <section class="page page--dark page--energy" data-page="09">
      <div class="copy"><p class="eyebrow">08 / DAILY COST</p><h2>需要剪的时候，才真正做功。</h2><p class="subtitle">把能源，用在真正需要的地方。</p><p class="body-copy">采购设备不能只看今天的价格。每天加工，一年下来，能耗、维护和使用习惯都会变成真正的成本。电动机械剪切主要在实际剪切动作中做功，结构直接，维护也更清晰。</p></div>
      <img class="product-visual" src="../assets/drive-dark.png" alt="电动剪板机动力系统">
    </section>
    <section class="page page--light page--materials" data-page="10">
      <div class="copy"><p class="eyebrow">MATERIAL RANGE</p><h2>一台机器，面对更多日常板材。</h2><p class="subtitle">从常见金属板材，到部分非金属板材加工。</p><p class="material-list">碳钢 · 不锈钢 · 镀锌板 · 铝板 · 铜板 · 彩钢板</p></div>
      <img class="product-visual" src="../assets/materials-light.png" alt="常见薄板材料样板">
      <p class="fine-print">不同材料的强度和允许厚度不同。环氧板、电路板、PVC 等非金属材料，需结合材料特性、厚度和试样结果确认。</p>
    </section>
    <section class="page page--light page--summary" data-page="11">
      <div class="copy"><p class="eyebrow">THE CHECKLIST</p><h2>所以，选剪板机到底看什么？</h2><div class="question-grid"><span>机身够不够稳</span><span>压料牢不牢</span><span>刀片耐不耐用</span><span>送料顺不顺</span><span>定位方不方便</span><span>长期使用省不省心</span></div><p class="body-copy">真正好用的机器，往往不是配置看起来最复杂的那一台。而是每天开机以后，每一步都顺手。</p></div>
      <img class="product-visual" src="../assets/hero-machine-light-alt.png" alt="完整电动剪板机侧前方视图">
    </section>
    <section class="page page--light page--closing" data-page="12">
      <div class="copy"><p class="eyebrow">READY FOR DAILY WORK</p><h2>把复杂的剪切，变成每天简单的工作。</h2><p class="subtitle">稳定剪切 · 顺畅送料 · 方便定位 · 简单操作</p><p class="body-copy">如果你正在寻找一台用于日常薄板加工的电动剪板机，请先确认四件事：</p><div class="inquiry-list"><span>你剪什么材料？</span><span>板材多厚？</span><span>最大加工长度多少？</span><span>每天大概加工多少？</span></div><p class="fine-print">根据真实加工需求选择设备，比单纯比较参数更重要。</p></div>
      <img class="product-visual" src="../assets/hero-machine-light-alt.png" alt="电动剪板机英雄产品图">
    </section>
  </main>
  <script>
    const requestedPage = new URLSearchParams(location.search).get("page");
    if (requestedPage) {
      document.body.classList.add("single-page");
      document.querySelector(`[data-page="${requestedPage}"]`)?.classList.add("is-active");
    }
  </script>
</body>
</html>
```

每页结构优先使用 `.copy`、`.eyebrow`、`h1/h2`、`.subtitle`、`.body-copy`、`.product-visual` 和 `.fine-print`。PAGE 11 的六个问题使用纯文字两列排版，不添加图标。PAGE 12 的四个采购问题使用四行文字，不做卡片按钮。

- [ ] **Step 2: 实现固定画布和统一设计令牌**

`styles.css` 以以下基础规则开头：

```css
:root {
  --canvas-w: 750px;
  --canvas-h: 1200px;
  --ink: #111317;
  --muted: #626974;
  --blue: #0879c9;
  --cool-white: #f7f9fb;
  --titanium: #15191f;
  --line-light: rgba(18, 27, 38, 0.12);
  --line-dark: rgba(255, 255, 255, 0.14);
  --side: 56px;
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
}

* { box-sizing: border-box; }
html, body { margin: 0; min-width: var(--canvas-w); background: #0d0f12; }
.detail-page { width: var(--canvas-w); margin: 0 auto; }
.page { position: relative; width: var(--canvas-w); height: var(--canvas-h); overflow: hidden; isolation: isolate; }
.page--light { color: var(--ink); background: linear-gradient(145deg, #ffffff 0%, #f1f4f7 62%, #e8edf2 100%); }
.page--dark { color: #f7f9fb; background: radial-gradient(circle at 72% 38%, #303944 0%, #171c22 47%, #0d1014 100%); }
.single-page .page { display: none; }
.single-page .page.is-active { display: block; }
.copy { position: absolute; z-index: 3; left: var(--side); right: var(--side); }
.eyebrow { margin: 0 0 18px; font-size: 16px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.62; }
h1, h2 { margin: 0; font-weight: 650; letter-spacing: -0.045em; line-height: 1.12; }
h1 { font-size: 62px; }
h2 { font-size: 56px; }
.subtitle { margin: 20px 0 0; font-size: 30px; line-height: 1.48; font-weight: 500; }
.body-copy { margin: 24px 0 0; max-width: 560px; font-size: 23px; line-height: 1.72; color: var(--muted); }
.page--dark .body-copy { color: rgba(247, 249, 251, 0.68); }
.product-visual { position: absolute; z-index: 1; display: block; object-fit: contain; }
.page::after { content: ""; position: absolute; z-index: 2; inset: auto 0 0; height: 26%; pointer-events: none; background: linear-gradient(transparent, rgba(10, 14, 20, 0.04)); }
```

按各页文案长度单独设置 `.copy` 和 `.product-visual` 的位置，不通过缩小全部字号解决拥挤。完整机器图片必须使用 `object-fit: contain`，不得裁断机器脚、上梁或脚踏。

- [ ] **Step 3: 实现 12 页具体构图**

按以下构图映射设置图片与背景：

```text
01 hero-machine-light.png      标题上方，完整机器位于下半部
02 frame-machine-dark.png      文案左上，机架从右下延伸
03 pressure-light.png          文案上方，压料近景占下半部
04 blade-dark.png              文案左上，刀片横向贯穿中下部
05 feed-balls-light.png        文案左上，薄板与滚珠形成斜向透视
06 drive-dark.png              文案左上，电机减速机居中偏下
07 backgauge-light.png         文案左上，真实后挡料占右下
08 hero-machine-light.png + foot-pedal-light.png  完整机器与脚踏分别分层
09 drive-dark.png              降低饱和度与对比，形成安静待机感
10 materials-light.png         材料样板位于下半部，说明置于底部安全区
11 hero-machine-light-alt.png  六组大字与机器形成左右/上下平衡
12 hero-machine-light-alt.png  标题上方，机器下方，四个询价问题收尾
```

PAGE 08 的脚踏图层必须与机器保持自然比例，不能看起来比控制箱更大。PAGE 09 不添加电流、电池或叶片类图标。PAGE 10 的材料名称使用 HTML 小字排版，不在生成图片里烧录文字。

- [ ] **Step 4: 运行内容合同测试**

Run: `node scripts/verify-electric-shear-taobao.mjs --content`

Expected: `content contract passed`.

- [ ] **Step 5: 在浏览器中人工预览长页和单页模式**

打开：

```text
file:///Users/zhangmingwei/Documents/电动剪板机/artifacts/electric-shear-taobao/src/index.html
file:///Users/zhangmingwei/Documents/电动剪板机/artifacts/electric-shear-taobao/src/index.html?page=07
```

检查长页顺序为 01–12，单页 URL 只显示指定画布，所有本地图片正常加载，没有水平滚动和文本溢出。

- [ ] **Step 6: 提交可编辑网页源文件**

```bash
git add artifacts/electric-shear-taobao/src scripts/verify-electric-shear-taobao.mjs
git commit -m "feat: build electric shear taobao detail page"
```

---

### Task 4: 实现自动截图、JPG 转换和长图拼接

**Files:**
- Create: `scripts/render-electric-shear-taobao.mjs`
- Create: `artifacts/electric-shear-taobao/output/png/`（12 张独立 PNG）
- Create: `artifacts/electric-shear-taobao/output/jpg/`（12 张独立 JPG）
- Create: `artifacts/electric-shear-taobao/output/electric-shear-taobao-long.png`
- Create: `artifacts/electric-shear-taobao/output/electric-shear-taobao-long.jpg`
- Test: `scripts/verify-electric-shear-taobao.mjs`

**Interfaces:**
- Consumes: `src/index.html?page=NN`，本机 Chrome 路径 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`，`sharp`。
- Produces: 12 张确定尺寸的 PNG/JPG 和两张确定尺寸的完整长图。

- [ ] **Step 1: 运行完整验证并确认它因成品尚未导出而失败**

Run: `npm run verify:taobao-electric-shear`

Expected: FAIL with `missing output`.

- [ ] **Step 2: 创建渲染脚本**

`scripts/render-electric-shear-taobao.mjs` 使用以下实现方式：

```js
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const root = process.cwd();
const artifact = path.join(root, "artifacts/electric-shear-taobao");
const htmlPath = path.join(artifact, "src/index.html");
const pngDir = path.join(artifact, "output/png");
const jpgDir = path.join(artifact, "output/jpg");
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

fs.mkdirSync(pngDir, { recursive: true });
fs.mkdirSync(jpgDir, { recursive: true });

for (let index = 1; index <= 12; index += 1) {
  const suffix = String(index).padStart(2, "0");
  const png = path.join(pngDir, `page-${suffix}.png`);
  const url = `${pathToFileURL(htmlPath).href}?page=${suffix}`;
  const result = spawnSync(chrome, [
    "--headless=new",
    "--hide-scrollbars",
    "--disable-gpu",
    "--force-device-scale-factor=1",
    "--window-size=750,1200",
    "--virtual-time-budget=1500",
    `--screenshot=${png}`,
    url,
  ], { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Chrome render failed for page ${suffix}`);
  await sharp(png).jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toFile(path.join(jpgDir, `page-${suffix}.jpg`));
}

const layers = Array.from({ length: 12 }, (_, index) => ({
  input: path.join(pngDir, `page-${String(index + 1).padStart(2, "0")}.png`),
  left: 0,
  top: index * 1200,
}));
const longPng = path.join(artifact, "output/electric-shear-taobao-long.png");
await sharp({ create: { width: 750, height: 14400, channels: 4, background: "#ffffff" } })
  .composite(layers)
  .png({ compressionLevel: 9 })
  .toFile(longPng);
await sharp(longPng)
  .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
  .toFile(path.join(artifact, "output/electric-shear-taobao-long.jpg"));
```

- [ ] **Step 3: 生成全部输出**

Run: `npm run render:taobao-electric-shear`

Expected: `output/png/` 和 `output/jpg/` 各生成 12 张图片，根输出目录生成 PNG/JPG 长图。

- [ ] **Step 4: 运行完整自动验证**

Run: `npm run verify:taobao-electric-shear`

Expected: `all taobao detail outputs passed`.

- [ ] **Step 5: 提交渲染器与第一版成品**

```bash
git add scripts/render-electric-shear-taobao.mjs artifacts/electric-shear-taobao/output
git commit -m "feat: export electric shear taobao artwork"
```

---

### Task 5: 逐页视觉 QA、针对性修订和最终交付

**Files:**
- Modify: `artifacts/electric-shear-taobao/src/index.html`
- Modify: `artifacts/electric-shear-taobao/src/styles.css`
- Modify only when needed: 文件结构中列出的 `artifacts/electric-shear-taobao/assets/` PNG
- Regenerate: `artifacts/electric-shear-taobao/output/**/*`

**Interfaces:**
- Consumes: 12 张 PNG 第一版和原始照片。
- Produces: 视觉校验通过的最终 JPG、PNG、长图和可编辑源文件。

- [ ] **Step 1: 制作 12 页缩略联系表**

使用 `sharp` 将 12 张 `page-NN.png` 缩小为 250 × 400 px，并按 3 列 × 4 行拼成 750 × 1600 px 的 QA 联系表，保存到 `artifacts/electric-shear-taobao/output/qa-contact-sheet.png`。联系表只用于 QA，不计入正式 12 页交付。

- [ ] **Step 2: 使用 `view_image` 检查整体节奏**

检查以下项目：

```text
冷白与深钛灰页面节奏是否为 01浅、02深、03浅、04深、05浅、06深、07浅、08浅、09深、10浅、11浅、12浅
每页是否只有一个核心标题和一个主要视觉焦点
机器蓝色是否保持一致，黄色是否只在脚踏/警示位置出现
页面之间是否避免重复使用完全相同的裁切和构图
标题、正文和图片是否保持足够留白
```

- [ ] **Step 3: 逐页以原始照片核对结构真实性**

重点核对：

```text
PAGE 01/08/11/12：上梁、立柱、工作台、检修板、控制箱、机脚和脚踏
PAGE 02：后部框架、传动轴、飞轮、拉杆和罩板
PAGE 03/04：压料头数量与间距、刀片和刀座紧固件
PAGE 05：滚珠位置、数量和台面结构
PAGE 06/09：电机、减速机、法兰、吊环、接线盒和线管
PAGE 07：两根调节杆、挡板、滑槽和紧固结构；不得出现数字显示或伺服件
```

如发现问题，只修改发生问题的资产或该页 CSS，不整体重做已通过页面。

- [ ] **Step 4: 检查文案和安全边界**

在 750 px 原尺寸下确认：正文最小字号不低于 22 px；没有文字碰到 56 px 左右安全边距；PAGE 10 包含材料限制说明；PAGE 12 清楚列出材料、厚度、最大长度和日产量四个询价问题；任何画面中都没有手部接近刀口。

- [ ] **Step 5: 重新渲染并执行最终验证**

Run:

```bash
npm run render:taobao-electric-shear
npm run verify:taobao-electric-shear
npm run build
git diff --check
```

Expected:

```text
all taobao detail outputs passed
Next.js production build succeeds
git diff --check returns no output
```

- [ ] **Step 6: 提交最终修订**

```bash
git add artifacts/electric-shear-taobao scripts/render-electric-shear-taobao.mjs scripts/verify-electric-shear-taobao.mjs package.json
git commit -m "fix: polish electric shear taobao artwork"
```

- [ ] **Step 7: 交付检查**

最终答复必须提供以下可点击绝对路径：

```text
artifacts/electric-shear-taobao/output/electric-shear-taobao-long.jpg
artifacts/electric-shear-taobao/output/jpg/
artifacts/electric-shear-taobao/output/png/
artifacts/electric-shear-taobao/src/index.html
artifacts/electric-shear-taobao/README.md
```

同时说明图像资产通过内置 ImageGen 编辑，中文排版由 HTML/CSS 完成，并明确第 7 页为手动后挡料版本。
