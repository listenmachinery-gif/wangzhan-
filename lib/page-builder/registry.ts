import { z } from "zod";

import { homepageRedesignDocument } from "@/lib/homepage/homepage-content";
import { aboutZyronDocument } from "@/lib/page-builder/about-zyron-content";
import {
  DEFAULT_PRODUCT_EXPLORER_CONTENT,
  productExplorerContentSchema,
} from "@/lib/product-explorer/config";
import type { PageComponentType } from "@/lib/page-builder/schema";
import {
  DEFAULT_PRODUCT_SEARCH_CONTENT,
  productSearchContentSchema,
} from "@/lib/product-search/config";

export type EditorFieldKind = "text" | "textarea" | "url" | "number" | "boolean" | "list" | "json";

export type ComponentDefinition = {
  type: PageComponentType;
  label: string;
  group: "基础" | "布局" | "外贸业务" | "营销";
  description: string;
  defaultContent: Record<string, unknown>;
  contentSchema: z.ZodType;
  editorFields: Array<{ key: string; label: string; kind: EditorFieldKind }>;
};

const text = z.string().max(5_000);
const shortText = z.string().max(240);
const url = z.string().max(2_048).refine((value) => value.startsWith("#") || (value.startsWith("/") && !value.startsWith("//")) || value.startsWith("https://"), "Use a page anchor, site-relative, or HTTPS URL.");
const optionalUrl = z.union([url, z.literal("")]);
const mediaUrl = z.string().max(2_048).refine((value) => value.startsWith("/") && !value.startsWith("//"), "Use a site-relative media path.");
const optionalMediaUrl = z.union([mediaUrl, z.literal("")]);
const cardSchema = z.object({ title: shortText, description: text, image: optionalMediaUrl, href: optionalUrl }).strict();
const imageSchema = z.object({ src: mediaUrl, alt: shortText }).strict();
const itemSchema = z.object({ title: shortText, body: text }).strict();

function define(definition: ComponentDefinition) {
  return definition;
}

function homepageDefaultContent(type: PageComponentType): Record<string, unknown> {
  const node = homepageRedesignDocument.nodes.find((candidate) => candidate.type === type);
  return (node?.content ?? {}) as Record<string, unknown>;
}

function aboutDefaultContent(type: PageComponentType): Record<string, unknown> {
  const node = aboutZyronDocument.nodes.find((candidate) => candidate.type === type);
  return (node?.content ?? {}) as Record<string, unknown>;
}

export const componentRegistry: ComponentDefinition[] = [
  define({ type: "HEADING", label: "标题", group: "基础", description: "页面标题或章节标题", defaultContent: { text: "Build better production lines.", level: 2 }, contentSchema: z.object({ text: shortText, level: z.number().int().min(1).max(6) }).strict(), editorFields: [{ key: "text", label: "标题文字", kind: "text" }, { key: "level", label: "标题级别", kind: "number" }] }),
  define({ type: "PARAGRAPH", label: "段落", group: "基础", description: "普通正文段落", defaultContent: { text: "Describe your machinery solution for global buyers." }, contentSchema: z.object({ text }).strict(), editorFields: [{ key: "text", label: "段落内容", kind: "textarea" }] }),
  define({ type: "IMAGE", label: "图片", group: "基础", description: "带替代文字的响应式图片", defaultContent: { src: "/brand/factory-showcase.png", alt: "ZYRON factory", caption: "" }, contentSchema: z.object({ src: mediaUrl, alt: shortText.min(1), caption: shortText }).strict(), editorFields: [{ key: "src", label: "图片地址", kind: "url" }, { key: "alt", label: "替代文字", kind: "text" }, { key: "caption", label: "图片说明", kind: "text" }] }),
  define({ type: "VIDEO", label: "视频", group: "基础", description: "视频与封面", defaultContent: { src: "/brand/zyron-hero-video.mp4", poster: "/products/hydraulic-press-brake-hero.png", title: "ZYRON machinery video" }, contentSchema: z.object({ src: mediaUrl, poster: optionalMediaUrl, title: shortText.min(1) }).strict(), editorFields: [{ key: "src", label: "视频地址", kind: "url" }, { key: "poster", label: "封面地址", kind: "url" }, { key: "title", label: "视频标题", kind: "text" }] }),
  define({ type: "BUTTON", label: "按钮", group: "基础", description: "站内或 HTTPS 链接按钮", defaultContent: { label: "Request a Quote", href: "/contact" }, contentSchema: z.object({ label: shortText.min(1), href: url }).strict(), editorFields: [{ key: "label", label: "按钮文字", kind: "text" }, { key: "href", label: "链接", kind: "url" }] }),
  define({ type: "DIVIDER", label: "分割线", group: "基础", description: "内容分割线", defaultContent: { label: "Section divider" }, contentSchema: z.object({ label: shortText }).strict(), editorFields: [{ key: "label", label: "无障碍说明", kind: "text" }] }),
  define({ type: "SPACER", label: "留白", group: "基础", description: "受控高度留白", defaultContent: { size: 48 }, contentSchema: z.object({ size: z.number().int().min(8).max(240) }).strict(), editorFields: [{ key: "size", label: "高度", kind: "number" }] }),
  define({ type: "ICON", label: "图标", group: "基础", description: "预设业务图标", defaultContent: { name: "factory", label: "Factory" }, contentSchema: z.object({ name: z.enum(["factory", "settings", "support", "product"]), label: shortText }).strict(), editorFields: [{ key: "name", label: "图标名称", kind: "text" }, { key: "label", label: "说明", kind: "text" }] }),
  define({ type: "RICH_TEXT", label: "富文本", group: "基础", description: "安全的结构化段落，不接受 HTML", defaultContent: { blocks: ["Precision machinery configured around your production needs."] }, contentSchema: z.object({ blocks: z.array(text).min(1).max(30) }).strict(), editorFields: [{ key: "blocks", label: "段落", kind: "list" }] }),
  define({ type: "SECTION", label: "区块容器", group: "布局", description: "页面区块容器", defaultContent: { label: "Content section" }, contentSchema: z.object({ label: shortText }).strict(), editorFields: [{ key: "label", label: "区块名称", kind: "text" }] }),
  define({ type: "ROW", label: "横向布局", group: "布局", description: "横向排列子组件", defaultContent: { label: "Row" }, contentSchema: z.object({ label: shortText }).strict(), editorFields: [{ key: "label", label: "布局名称", kind: "text" }] }),
  define({ type: "COLUMNS", label: "多栏布局", group: "布局", description: "可响应的多栏容器", defaultContent: { label: "Columns", columns: 2 }, contentSchema: z.object({ label: shortText, columns: z.number().int().min(2).max(6) }).strict(), editorFields: [{ key: "label", label: "布局名称", kind: "text" }, { key: "columns", label: "列数", kind: "number" }] }),
  define({ type: "GRID", label: "网格布局", group: "布局", description: "卡片网格容器", defaultContent: { label: "Grid", columns: 3 }, contentSchema: z.object({ label: shortText, columns: z.number().int().min(1).max(6) }).strict(), editorFields: [{ key: "label", label: "布局名称", kind: "text" }, { key: "columns", label: "列数", kind: "number" }] }),
  define({ type: "TABS", label: "标签页", group: "布局", description: "内容标签页", defaultContent: { items: [{ title: "Overview", body: "Machine overview" }, { title: "Support", body: "Global support" }] }, contentSchema: z.object({ items: z.array(itemSchema).min(1).max(8) }).strict(), editorFields: [{ key: "items", label: "标签内容", kind: "json" }] }),
  define({ type: "ACCORDION", label: "折叠面板", group: "布局", description: "可展开内容列表", defaultContent: { items: [{ title: "How to select a machine?", body: "Share material, thickness and working length." }] }, contentSchema: z.object({ items: z.array(itemSchema).min(1).max(20) }).strict(), editorFields: [{ key: "items", label: "面板内容", kind: "json" }] }),
  define({ type: "HERO", label: "首屏横幅", group: "营销", description: "主视觉与行动按钮", defaultContent: { eyebrow: "ZYRON Heavy Industry", title: "Industrial machinery solutions", description: "Configured for real production requirements.", primaryLabel: "Explore Products", primaryHref: "/products", image: "/products/hydraulic-press-brake-hero.png", alt: "ZYRON industrial machinery" }, contentSchema: z.object({ eyebrow: shortText, title: shortText.min(1), description: text, primaryLabel: shortText, primaryHref: url, image: mediaUrl, alt: shortText.min(1) }).strict(), editorFields: [{ key: "eyebrow", label: "眉题", kind: "text" }, { key: "title", label: "标题", kind: "text" }, { key: "description", label: "描述", kind: "textarea" }, { key: "image", label: "背景图片", kind: "url" }] }),
  define({ type: "PRODUCT_CARDS", label: "产品卡片", group: "外贸业务", description: "产品卡片列表", defaultContent: { heading: "Featured Products", items: [{ title: "Shearing Machine", description: "Precision sheet cutting", image: "/products/home-categories/shearing.png", href: "/products" }] }, contentSchema: z.object({ heading: shortText, items: z.array(cardSchema).min(1).max(12) }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "items", label: "产品", kind: "json" }] }),
  define({ type: "CATEGORY_CARDS", label: "产品分类", group: "外贸业务", description: "产品分类入口", defaultContent: { heading: "Product Categories", items: [{ title: "Sheet Metal Machinery", description: "Explore production equipment", image: "/products/product-center-hero.png", href: "/products" }] }, contentSchema: z.object({ heading: shortText, items: z.array(cardSchema).min(1).max(16) }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "items", label: "分类", kind: "json" }] }),
  define({ type: "PRODUCT_CAROUSEL", label: "产品轮播", group: "外贸业务", description: "横向产品推荐", defaultContent: { heading: "Recommended Machines", items: [{ title: "Press Brake", description: "Bending solution", image: "/products/hydraulic-press-brake-hero.png", href: "/products" }] }, contentSchema: z.object({ heading: shortText, items: z.array(cardSchema).min(1).max(12) }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "items", label: "产品", kind: "json" }] }),
  define({
    type: "PRODUCT_EXPLORER",
    label: "产品总页交互探索器",
    group: "外贸业务",
    description: "八大机械系列交互首屏与真实产品横向浏览（仅用于 Products 页面）",
    defaultContent: DEFAULT_PRODUCT_EXPLORER_CONTENT,
    contentSchema: productExplorerContentSchema,
    editorFields: [
      { key: "eyebrow", label: "品牌标签", kind: "text" },
      { key: "title", label: "主标题", kind: "textarea" },
      { key: "subtitle", label: "绿色副标题", kind: "text" },
      { key: "description", label: "说明文字", kind: "textarea" },
    ],
  }),
  define({
    type: "PRODUCT_SEARCH",
    label: "产品总页高级搜索",
    group: "外贸业务",
    description: "产品名称、型号和系列实时搜索（仅用于 Products 页面）",
    defaultContent: DEFAULT_PRODUCT_SEARCH_CONTENT,
    contentSchema: productSearchContentSchema,
    editorFields: [
      { key: "eyebrow", label: "品牌标签", kind: "text" },
      { key: "titleLineOne", label: "标题第一行", kind: "textarea" },
      { key: "titleAccent", label: "绿色强调标题", kind: "textarea" },
      { key: "titleSuffix", label: "标题后缀", kind: "textarea" },
      { key: "description", label: "说明文字", kind: "textarea" },
    ],
  }),
  define({ type: "SPECIFICATION_TABLE", label: "设备参数表", group: "外贸业务", description: "型号参数表", defaultContent: { heading: "Specifications", columns: ["Model", "Value"], rows: [["ZY-100", "Configured on request"]] }, contentSchema: z.object({ heading: shortText, columns: z.array(shortText).min(2).max(12), rows: z.array(z.array(shortText).min(1).max(12)).max(50) }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "columns", label: "列", kind: "list" }, { key: "rows", label: "数据", kind: "json" }] }),
  define({ type: "MODEL_COMPARISON", label: "型号对比", group: "外贸业务", description: "对比不同型号", defaultContent: { heading: "Compare Models", columns: ["Feature", "Model A", "Model B"], rows: [["Application", "Light duty", "Production"]] }, contentSchema: z.object({ heading: shortText, columns: z.array(shortText).min(2).max(12), rows: z.array(z.array(shortText).min(1).max(12)).max(50) }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "rows", label: "对比数据", kind: "json" }] }),
  define({ type: "PRODUCT_GALLERY", label: "产品图库", group: "外贸业务", description: "产品图片画廊", defaultContent: { heading: "Machine Gallery", images: [{ src: "/products/hydraulic-press-brake-hero.png", alt: "ZYRON machine" }] }, contentSchema: z.object({ heading: shortText, images: z.array(imageSchema).min(1).max(20) }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "images", label: "图片", kind: "json" }] }),
  define({ type: "FACTORY_STATS", label: "工厂介绍", group: "外贸业务", description: "工厂介绍和已核实数据", defaultContent: { eyebrow: "Company Strength", heading: "Manufacturing capabilities behind every solution.", description: "Explore the machinery processes available from ZYRON.", image: "/brand/factory-showcase.png", imageAlt: "ZYRON Heavy Industry factory exterior", ctaLabel: "Explore Company", ctaHref: "/factory", stats: [{ value: "Cutting", label: "Sheet Processing" }, { value: "Bending", label: "Forming Equipment" }] }, contentSchema: z.object({ eyebrow: shortText, heading: shortText, description: text, image: mediaUrl, imageAlt: shortText, ctaLabel: shortText, ctaHref: url, stats: z.array(z.object({ value: shortText, label: shortText }).strict()).min(1).max(8) }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "description", label: "描述", kind: "textarea" }, { key: "image", label: "背景图", kind: "url" }, { key: "stats", label: "能力或已核实数据", kind: "json" }] }),
  define({ type: "CERTIFICATES", label: "文件与认证", group: "外贸业务", description: "订单文件、认证与资质（发布前需核实）", defaultContent: { heading: "Documents available for verification", items: ["Machine specification confirmation", "Pre-shipment inspection records", "Operation and maintenance documents", "Export packing information"] }, contentSchema: z.object({ heading: shortText, items: z.array(shortText).min(1).max(20) }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "items", label: "已核实文件或认证", kind: "list" }] }),
  define({ type: "CUSTOMER_CASES", label: "客户案例", group: "外贸业务", description: "客户项目案例", defaultContent: { heading: "Customer Cases", items: [{ title: "Global installation", description: "A configured production solution", image: "/brand/factory-showcase.png", href: "/cases" }] }, contentSchema: z.object({ heading: shortText, items: z.array(cardSchema).min(1).max(12) }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "items", label: "案例", kind: "json" }] }),
  define({ type: "APPLICATIONS", label: "应用行业", group: "外贸业务", description: "适用行业", defaultContent: { heading: "Applications", items: [{ title: "Sheet Metal Fabrication", body: "Flexible production workflows" }] }, contentSchema: z.object({ heading: shortText, items: z.array(itemSchema).min(1).max(16) }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "items", label: "行业", kind: "json" }] }),
  define({ type: "ADVANTAGES", label: "技术优势", group: "外贸业务", description: "优势与卖点", defaultContent: { eyebrow: "Why Choose ZYRON", heading: "Why choose ZYRON", description: "Practical production answers for global buyers.", items: [{ title: "Complete Product Range", body: "Multiple metalworking processes from one supplier." }], primaryLabel: "Explore Product Series", primaryHref: "/products", secondaryLabel: "Ask an Engineer", secondaryHref: "/contact" }, contentSchema: z.object({ eyebrow: shortText, heading: shortText, description: text, items: z.array(itemSchema).min(1).max(12), primaryLabel: shortText, primaryHref: url, secondaryLabel: shortText, secondaryHref: url }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "description", label: "描述", kind: "textarea" }, { key: "items", label: "优势", kind: "json" }] }),
  define({ type: "FAQ", label: "常见问题", group: "外贸业务", description: "常见问题", defaultContent: { heading: "Frequently Asked Questions", items: [{ title: "How do I get a quotation?", body: "Share material, thickness, size, voltage and destination." }] }, contentSchema: z.object({ heading: shortText, items: z.array(itemSchema).min(1).max(30) }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "items", label: "问答", kind: "json" }] }),
  define({ type: "INQUIRY_CTA", label: "询盘行动按钮", group: "营销", description: "询盘行动入口", defaultContent: { heading: "Discuss your production requirements", description: "Our engineers will recommend a suitable configuration.", label: "Request a Quote", href: "/contact" }, contentSchema: z.object({ heading: shortText, description: text, label: shortText, href: url }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "description", label: "描述", kind: "textarea" }, { key: "label", label: "按钮", kind: "text" }] }),
  define({ type: "WHATSAPP_CTA", label: "WhatsApp 行动按钮", group: "营销", description: "WhatsApp 外部沟通入口", defaultContent: { heading: "Talk to our sales team", label: "Open WhatsApp", href: "https://wa.me/" }, contentSchema: z.object({ heading: shortText, label: shortText, href: z.string().url().startsWith("https://") }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "label", label: "按钮", kind: "text" }, { key: "href", label: "WhatsApp 链接", kind: "url" }] }),
  define({ type: "DOWNLOAD_CATALOG", label: "下载目录", group: "营销", description: "目录下载入口", defaultContent: { heading: "Download Product Catalog", description: "Review available machine families and configurations.", label: "Download PDF", href: "/contact" }, contentSchema: z.object({ heading: shortText, description: text, label: shortText, href: url }).strict(), editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "description", label: "描述", kind: "textarea" }, { key: "href", label: "文件链接", kind: "url" }] }),

  define({
    type: "SPLIT_FEATURE", label: "图文双栏", group: "外贸业务", description: "图文左右交错展示，适合设备特征、技术和公司介绍",
    defaultContent: { eyebrow: "Engineering Detail", title: "Designed around your process", body: "Explain the product feature or manufacturing process with clear evidence.", image: "/products/hydraulic-press-brake-hero.png", imageAlt: "ZYRON machinery detail", reverse: false, ctaLabel: "Explore Products", ctaHref: "/products" },
    contentSchema: z.object({ eyebrow: shortText, title: shortText.min(1), body: text, image: mediaUrl, imageAlt: shortText.min(1), reverse: z.boolean(), ctaLabel: shortText, ctaHref: url }).strict(),
    editorFields: [{ key: "eyebrow", label: "眉题", kind: "text" }, { key: "title", label: "主标题", kind: "text" }, { key: "body", label: "正文", kind: "textarea" }, { key: "image", label: "图片地址", kind: "url" }, { key: "imageAlt", label: "图片替代文字", kind: "text" }, { key: "reverse", label: "反向排列（true/false）", kind: "json" }, { key: "ctaLabel", label: "按钮文字", kind: "text" }, { key: "ctaHref", label: "按钮链接", kind: "url" }],
  }),
  define({
    type: "TIMELINE", label: "发展历程 / 流程", group: "外贸业务", description: "公司时间轴、交付步骤和服务流程",
    defaultContent: { heading: "Our Process", items: [{ year: "01", title: "Requirement Review", body: "Confirm materials, dimensions and capacity." }, { year: "02", title: "Configuration", body: "Discuss the suitable machine and options." }] },
    contentSchema: z.object({ heading: shortText, items: z.array(z.object({ year: shortText, title: shortText, body: text }).strict()).min(1).max(20) }).strict(),
    editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "items", label: "时间轴条目", kind: "json" }],
  }),
  define({
    type: "RESOURCE_LINKS", label: "支持中心入口", group: "外贸业务", description: "支持文档、下载、服务、视频等资源入口",
    defaultContent: { heading: "Find What You Need", description: "Access practical resources before and after delivery.", items: [{ title: "Technical Support", description: "Contact our team for guidance", href: "/contact" }, { title: "Company News", description: "Explore updates and announcements", href: "/news" }] },
    contentSchema: z.object({ heading: shortText, description: text, items: z.array(z.object({ title: shortText, description: text, href: url }).strict()).min(1).max(16) }).strict(),
    editorFields: [{ key: "heading", label: "标题", kind: "text" }, { key: "description", label: "描述", kind: "textarea" }, { key: "items", label: "资源链接", kind: "json" }],
  }),
  define({
    type: "INQUIRY_FORM", label: "真实询盘表单", group: "营销", description: "复用当前网站询盘接口与跟踪逻辑，不能替换成静态假表单",
    defaultContent: { eyebrow: "Talk to ZYRON", heading: "Tell us about your production requirements.", description: "Material, thickness, working length and destination help us respond." },
    contentSchema: z.object({ eyebrow: shortText, heading: shortText.min(1), description: text }).strict(),
    editorFields: [{ key: "eyebrow", label: "眉题", kind: "text" }, { key: "heading", label: "表单标题", kind: "text" }, { key: "description", label: "补充说明", kind: "textarea" }],
  }),
];


componentRegistry.push(
  define({
    type: "MEDIA_HERO", label: "大图/视频首屏", group: "营销",
    description: "参考 HARSLE 的大面积主视觉，支持完整背景或左右图文、图片或视频独立更换",
    defaultContent: {
      eyebrow: "ZYRON Heavy Industry", title: "Machines Made for Precision",
      description: "Discover high-quality sheet metal equipment designed for your production.",
      image: "/products/hydraulic-press-brake-hero.png", videoSrc: "",
      poster: "/products/hydraulic-press-brake-hero.png", alt: "Industrial machine",
      layout: "full", mediaKind: "image", mediaSide: "right",
      primaryLabel: "Explore Products", primaryHref: "/products",
      secondaryLabel: "Request a Quote", secondaryHref: "/contact",
    },
    contentSchema: z.object({
      eyebrow: shortText, title: shortText.min(1), description: text,
      image: mediaUrl, videoSrc: optionalMediaUrl, poster: optionalMediaUrl, alt: shortText.min(1),
      layout: z.enum(["full","split"]), mediaKind: z.enum(["image","video"]),
      mediaSide: z.enum(["left","right"]), primaryLabel: shortText, primaryHref: url,
      secondaryLabel: shortText, secondaryHref: url,
    }).strict(),
    editorFields: [
      { key: "eyebrow", label: "眉题", kind: "text" },
      { key: "title", label: "标题", kind: "text" },
      { key: "description", label: "正文", kind: "textarea" },
      { key: "layout", label: "布局 full / split", kind: "text" },
      { key: "mediaKind", label: "媒体 image / video", kind: "text" },
      { key: "mediaSide", label: "图片位置 left / right", kind: "text" },
      { key: "image", label: "图片（媒体库可替换）", kind: "url" },
      { key: "videoSrc", label: "视频（媒体库可替换）", kind: "url" },
      { key: "poster", label: "视频封面", kind: "url" },
      { key: "alt", label: "替代文字", kind: "text" },
      { key: "primaryLabel", label: "主按钮文字", kind: "text" },
      { key: "primaryHref", label: "主按钮链接", kind: "url" },
      { key: "secondaryLabel", label: "副按钮文字", kind: "text" },
      { key: "secondaryHref", label: "副按钮链接", kind: "url" },
    ],
  }),
  define({
    type: "MEDIA_SHOWCASE", label: "图片视频展示网格", group: "外贸业务",
    description: "混合图片和视频的展示模块，适用工厂、案例、客户展示、工序说明",
    defaultContent: {
      eyebrow: "Showcase", heading: "Machinery in Action",
      description: "Explore real production scenes and equipment demonstrations.",
      items: [{ title: "Factory Showcase", description: "ZYRON production equipment", src: "/brand/factory-showcase.png", mediaKind: "image", alt: "Factory showcase" }],
    },
    contentSchema: z.object({
      eyebrow: shortText, heading: shortText.min(1), description: text,
      items: z.array(z.object({
        title: shortText, description: text, src: mediaUrl,
        mediaKind: z.enum(["image","video"]), alt: shortText,
      }).strict()).min(1).max(24),
    }).strict(),
    editorFields: [
      { key: "eyebrow", label: "眉题", kind: "text" },
      { key: "heading", label: "标题", kind: "text" },
      { key: "description", label: "介绍", kind: "textarea" },
      { key: "items", label: "素材（支持媒体库单项替换）", kind: "json" },
    ],
  }),
);

const homepageStatSchema = z.object({
  value: z.number().int().min(0).max(1_000_000),
  suffix: shortText,
  unit: shortText,
  label: shortText.min(1),
}).strict();

const homepageProductSchema = z.object({
  id: shortText.min(1),
  name: shortText.min(1),
  eyebrow: shortText,
  headline: shortText.min(1),
  description: text,
  buttonText: shortText.min(1),
  image: mediaUrl,
  href: url,
  alt: shortText.min(1),
}).strict();

const homepageAdvantageSchema = z.object({
  number: shortText.min(1),
  title: shortText.min(1),
  body: text,
}).strict();

const homepageNewsSchema = z.object({
  id: shortText.min(1),
  category: shortText.min(1),
  title: shortText.min(1),
  excerpt: text,
  image: mediaUrl,
  imageAlt: shortText.min(1),
  href: optionalUrl,
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
}).strict();

componentRegistry.push(
  define({
    type: "HOME_HERO",
    label: "首页设备横幅",
    group: "营销",
    description: "首页首屏设备主视觉、文案和产品入口",
    defaultContent: homepageDefaultContent("HOME_HERO"),
    contentSchema: z.object({
      eyebrow: shortText,
      title: shortText.min(1),
      description: text,
      primaryLabel: shortText.min(1),
      primaryHref: url,
      image: mediaUrl,
      alt: shortText.min(1),
    }).strict(),
    editorFields: [
      { key: "eyebrow", label: "眉题", kind: "text" },
      { key: "title", label: "主标题", kind: "text" },
      { key: "description", label: "介绍", kind: "textarea" },
      { key: "primaryLabel", label: "按钮文字", kind: "text" },
      { key: "primaryHref", label: "按钮链接", kind: "url" },
      { key: "image", label: "设备图片（媒体库可替换）", kind: "url" },
      { key: "alt", label: "图片替代文字", kind: "text" },
    ],
  }),
  define({
    type: "HOME_ABOUT",
    label: "首页品牌与实力",
    group: "外贸业务",
    description: "工厂照片、品牌介绍和已确认企业数据",
    defaultContent: homepageDefaultContent("HOME_ABOUT"),
    contentSchema: z.object({
      eyebrow: shortText,
      title: shortText.min(1),
      description: text,
      image: mediaUrl,
      imageAlt: shortText.min(1),
      ctaLabel: shortText.min(1),
      ctaHref: url,
      stats: z.array(homepageStatSchema).min(1).max(8),
    }).strict(),
    editorFields: [
      { key: "eyebrow", label: "眉题", kind: "text" },
      { key: "title", label: "主标题", kind: "text" },
      { key: "description", label: "品牌介绍", kind: "textarea" },
      { key: "image", label: "工厂图片（媒体库可替换）", kind: "url" },
      { key: "imageAlt", label: "图片替代文字", kind: "text" },
      { key: "stats", label: "企业实力数据", kind: "json" },
      { key: "ctaLabel", label: "链接文字", kind: "text" },
      { key: "ctaHref", label: "链接地址", kind: "url" },
    ],
  }),
  define({
    type: "HOME_PRODUCT_SHOWCASE",
    label: "首页八大产品",
    group: "外贸业务",
    description: "可点击切换的八大产品系列、专属文案、图片和链接",
    defaultContent: homepageDefaultContent("HOME_PRODUCT_SHOWCASE"),
    contentSchema: z.object({
      eyebrow: shortText,
      heading: shortText.min(1),
      description: text,
      items: z.array(homepageProductSchema).min(1).max(12),
    }).strict(),
    editorFields: [
      { key: "eyebrow", label: "眉题", kind: "text" },
      { key: "heading", label: "主标题", kind: "text" },
      { key: "description", label: "介绍", kind: "textarea" },
      { key: "items", label: "产品系列（单项图片可从媒体库替换）", kind: "json" },
    ],
  }),
  define({
    type: "HOME_WHY_CHOOSE",
    label: "首页品牌优势",
    group: "外贸业务",
    description: "品牌科技形象、核心优势和公司入口",
    defaultContent: homepageDefaultContent("HOME_WHY_CHOOSE"),
    contentSchema: z.object({
      eyebrow: shortText,
      title: shortText.min(1),
      description: text,
      image: mediaUrl,
      imageAlt: shortText.min(1),
      items: z.array(homepageAdvantageSchema).min(1).max(8),
      ctaLabel: shortText.min(1),
      ctaHref: url,
    }).strict(),
    editorFields: [
      { key: "eyebrow", label: "眉题", kind: "text" },
      { key: "title", label: "主标题", kind: "text" },
      { key: "description", label: "品牌介绍", kind: "textarea" },
      { key: "image", label: "品牌图片（媒体库可替换）", kind: "url" },
      { key: "imageAlt", label: "图片替代文字", kind: "text" },
      { key: "items", label: "核心优势", kind: "json" },
      { key: "ctaLabel", label: "按钮文字", kind: "text" },
      { key: "ctaHref", label: "按钮链接", kind: "url" },
    ],
  }),
  define({
    type: "HOME_NEWS_INSIGHTS",
    label: "首页行业洞察",
    group: "外贸业务",
    description: "只展示状态为已发布且拥有真实详情链接的行业文章",
    defaultContent: homepageDefaultContent("HOME_NEWS_INSIGHTS"),
    contentSchema: z.object({
      eyebrow: shortText,
      heading: shortText.min(1),
      description: text,
      viewAllLabel: shortText.min(1),
      viewAllHref: url,
      items: z.array(homepageNewsSchema).max(12),
    }).strict(),
    editorFields: [
      { key: "eyebrow", label: "眉题", kind: "text" },
      { key: "heading", label: "主标题", kind: "text" },
      { key: "description", label: "介绍", kind: "textarea" },
      { key: "viewAllLabel", label: "全部文章入口文字", kind: "text" },
      { key: "viewAllHref", label: "全部文章入口", kind: "url" },
      { key: "items", label: "文章（草稿 / 已发布）", kind: "json" },
    ],
  }),
  define({
    type: "HOME_CONTACT_CTA",
    label: "首页询价转化",
    group: "营销",
    description: "复用真实询盘接口的首页报价表单和联系入口",
    defaultContent: homepageDefaultContent("HOME_CONTACT_CTA"),
    contentSchema: z.object({
      eyebrow: shortText,
      title: shortText.min(1),
      description: text,
      emphasis: shortText,
      primaryLabel: shortText.min(1),
      secondaryLabel: shortText.min(1),
      secondaryHref: url,
      formTitle: shortText.min(1),
      formDescription: text,
      privacyText: text,
      machineOptions: z.array(shortText.min(1)).min(1).max(20),
    }).strict(),
    editorFields: [
      { key: "eyebrow", label: "眉题", kind: "text" },
      { key: "title", label: "主标题", kind: "text" },
      { key: "description", label: "介绍", kind: "textarea" },
      { key: "emphasis", label: "品牌强调语", kind: "text" },
      { key: "primaryLabel", label: "主按钮文字", kind: "text" },
      { key: "secondaryLabel", label: "联系入口文字", kind: "text" },
      { key: "secondaryHref", label: "联系入口", kind: "url" },
      { key: "formTitle", label: "表单标题", kind: "text" },
      { key: "formDescription", label: "表单说明", kind: "textarea" },
      { key: "machineOptions", label: "设备选项", kind: "list" },
      { key: "privacyText", label: "隐私说明", kind: "textarea" },
    ],
  }),
);

const aboutValueSchema = z.object({ title: shortText.min(1) }).strict();
const aboutGalleryImageSchema = z.object({
  src: mediaUrl,
  alt: shortText.min(1),
  focus: shortText,
}).strict();
const aboutProcessSchema = z.object({
  number: shortText.min(1),
  title: shortText.min(1),
  body: text,
  src: mediaUrl,
  alt: shortText.min(1),
}).strict();
const aboutStatSchema = z.object({ value: shortText.min(1), label: shortText.min(1) }).strict();
const aboutPointSchema = z.object({ title: shortText.min(1), body: text }).strict();
const aboutMediaCardSchema = z.object({
  number: shortText.min(1),
  title: shortText.min(1),
  body: text,
  src: mediaUrl,
  alt: shortText.min(1),
  focus: shortText,
}).strict();
const aboutDeliveryCardSchema = z.object({
  number: shortText.min(1),
  title: shortText.min(1),
  description: text,
  src: mediaUrl,
  alt: shortText.min(1),
  href: url,
  focus: shortText,
}).strict();

componentRegistry.push(
  define({
    type: "ABOUT_HERO",
    label: "关于 ZYRON · 首屏",
    group: "营销",
    description: "斜切工厂主视觉、品牌价值和行动按钮",
    defaultContent: aboutDefaultContent("ABOUT_HERO"),
    contentSchema: z.object({
      enabled: z.boolean(),
      desktopImage: mediaUrl,
      mobileImage: mediaUrl,
      imageAlt: shortText.min(1),
      eyebrow: shortText,
      titleLineOne: shortText.min(1),
      titleLineTwo: shortText.min(1),
      highlight: shortText,
      description: text,
      values: z.array(aboutValueSchema).min(1).max(6),
      ctaLabel: shortText,
      ctaHref: url,
      showCta: z.boolean(),
      imagePosition: shortText,
      overlayOpacity: z.number().int().min(40).max(100),
      showDiagonal: z.boolean(),
      showMetalDecoration: z.boolean(),
    }).strict(),
    editorFields: [
      { key: "enabled", label: "显示首屏", kind: "boolean" },
      { key: "desktopImage", label: "桌面端背景图片（媒体库可替换）", kind: "url" },
      { key: "mobileImage", label: "手机端背景图片（媒体库可替换）", kind: "url" },
      { key: "imageAlt", label: "图片替代文字", kind: "text" },
      { key: "eyebrow", label: "品牌标签", kind: "text" },
      { key: "titleLineOne", label: "主标题第一行", kind: "text" },
      { key: "titleLineTwo", label: "主标题第二行", kind: "text" },
      { key: "highlight", label: "绿色高亮文字", kind: "text" },
      { key: "description", label: "副标题", kind: "textarea" },
      { key: "values", label: "核心品牌价值", kind: "json" },
      { key: "ctaLabel", label: "按钮文字", kind: "text" },
      { key: "ctaHref", label: "按钮链接", kind: "url" },
      { key: "showCta", label: "显示按钮", kind: "boolean" },
      { key: "imagePosition", label: "背景图片焦点", kind: "text" },
      { key: "overlayOpacity", label: "斜切蒙层透明度", kind: "number" },
      { key: "showDiagonal", label: "显示斜切装饰", kind: "boolean" },
      { key: "showMetalDecoration", label: "显示底部金属装饰", kind: "boolean" },
    ],
  }),
  define({
    type: "ABOUT_COMPANY_OVERVIEW",
    label: "关于 ZYRON · 公司介绍",
    group: "外贸业务",
    description: "公司文案、品牌价值与 2×2 工厂图库",
    defaultContent: aboutDefaultContent("ABOUT_COMPANY_OVERVIEW"),
    contentSchema: z.object({
      enabled: z.boolean(),
      eyebrow: shortText,
      title: shortText.min(1),
      highlight: shortText,
      paragraphs: z.array(text).min(1).max(10),
      values: z.array(aboutValueSchema).min(1).max(6),
      ctaLabel: shortText,
      ctaHref: url,
      showCta: z.boolean(),
      showGeometry: z.boolean(),
      showMetalDecoration: z.boolean(),
      images: z.array(aboutGalleryImageSchema).min(1).max(8),
    }).strict(),
    editorFields: [
      { key: "enabled", label: "显示模块", kind: "boolean" },
      { key: "eyebrow", label: "品牌标签", kind: "text" },
      { key: "title", label: "主标题", kind: "text" },
      { key: "highlight", label: "绿色高亮文字", kind: "text" },
      { key: "paragraphs", label: "公司介绍段落", kind: "list" },
      { key: "values", label: "核心品牌价值", kind: "json" },
      { key: "ctaLabel", label: "按钮文字", kind: "text" },
      { key: "ctaHref", label: "按钮链接", kind: "url" },
      { key: "showCta", label: "显示按钮", kind: "boolean" },
      { key: "showGeometry", label: "显示背景几何装饰", kind: "boolean" },
      { key: "showMetalDecoration", label: "显示底部金属装饰", kind: "boolean" },
      { key: "images", label: "工厂图片（可单独替换和排序）", kind: "json" },
    ],
  }),
  define({
    type: "ABOUT_MANUFACTURING",
    label: "关于 ZYRON · 制造能力",
    group: "外贸业务",
    description: "制造工艺文字与同步排序的斜切图片矩阵",
    defaultContent: aboutDefaultContent("ABOUT_MANUFACTURING"),
    contentSchema: z.object({
      enabled: z.boolean(),
      eyebrow: shortText,
      title: shortText.min(1),
      highlight: shortText,
      description: text,
      processes: z.array(aboutProcessSchema).min(1).max(8),
      ctaLabel: shortText,
      ctaHref: optionalUrl,
      showCta: z.boolean(),
      showGeometry: z.boolean(),
      showMetalDecoration: z.boolean(),
      galleryAngle: z.number().int().min(0).max(24),
      galleryGap: z.number().int().min(4).max(30),
    }).strict(),
    editorFields: [
      { key: "enabled", label: "显示模块", kind: "boolean" },
      { key: "eyebrow", label: "品牌标签", kind: "text" },
      { key: "title", label: "主标题", kind: "text" },
      { key: "highlight", label: "绿色高亮文字", kind: "text" },
      { key: "description", label: "介绍", kind: "textarea" },
      { key: "processes", label: "制造工艺（文字与图片同步排序）", kind: "json" },
      { key: "ctaLabel", label: "按钮文字", kind: "text" },
      { key: "ctaHref", label: "按钮链接", kind: "url" },
      { key: "showCta", label: "显示按钮", kind: "boolean" },
      { key: "showGeometry", label: "显示背景几何装饰", kind: "boolean" },
      { key: "showMetalDecoration", label: "显示底部金属装饰", kind: "boolean" },
      { key: "galleryAngle", label: "图片斜切角度", kind: "number" },
      { key: "galleryGap", label: "图片间距", kind: "number" },
    ],
  }),
  define({
    type: "ABOUT_NUMBERS",
    label: "关于 ZYRON · 企业实力",
    group: "外贸业务",
    description: "居中标题、可核实数据和工厂全景；禁止填写未经确认的数据",
    defaultContent: aboutDefaultContent("ABOUT_NUMBERS"),
    contentSchema: z.object({
      enabled: z.boolean(), eyebrow: shortText, title: shortText.min(1), highlight: shortText,
      description: text, stats: z.array(aboutStatSchema).min(1).max(6), image: mediaUrl,
      imageAlt: shortText.min(1), imageFocus: shortText, showMetalDecoration: z.boolean(),
    }).strict(),
    editorFields: [
      { key: "enabled", label: "显示模块", kind: "boolean" },
      { key: "eyebrow", label: "品牌标签", kind: "text" },
      { key: "title", label: "主标题", kind: "text" },
      { key: "highlight", label: "绿色高亮文字", kind: "text" },
      { key: "description", label: "说明", kind: "textarea" },
      { key: "stats", label: "已核实数据或能力（可增删和排序）", kind: "json" },
      { key: "image", label: "工厂全景（媒体库可替换）", kind: "url" },
      { key: "imageAlt", label: "图片替代文字", kind: "text" },
      { key: "imageFocus", label: "图片焦点", kind: "text" },
      { key: "showMetalDecoration", label: "显示底部金属装饰", kind: "boolean" },
    ],
  }),
  define({
    type: "ABOUT_QUALITY",
    label: "关于 ZYRON · 品质控制",
    group: "外贸业务",
    description: "品质流程、检验图片和经核实认证；认证列表默认留空",
    defaultContent: aboutDefaultContent("ABOUT_QUALITY"),
    contentSchema: z.object({
      enabled: z.boolean(), eyebrow: shortText, title: shortText.min(1), highlight: shortText,
      description: text, points: z.array(aboutPointSchema).min(1).max(8), image: mediaUrl,
      imageAlt: shortText.min(1), imageFocus: shortText, certifications: z.array(shortText).max(8),
      ctaLabel: shortText, ctaHref: url, showCta: z.boolean(),
    }).strict(),
    editorFields: [
      { key: "enabled", label: "显示模块", kind: "boolean" },
      { key: "eyebrow", label: "品牌标签", kind: "text" },
      { key: "title", label: "主标题", kind: "text" },
      { key: "highlight", label: "绿色高亮文字", kind: "text" },
      { key: "description", label: "品质说明", kind: "textarea" },
      { key: "points", label: "品质流程（可增删和排序）", kind: "json" },
      { key: "image", label: "检验图片（媒体库可替换）", kind: "url" },
      { key: "imageAlt", label: "图片替代文字", kind: "text" },
      { key: "imageFocus", label: "图片焦点", kind: "text" },
      { key: "certifications", label: "已核实认证（无证明请留空）", kind: "list" },
      { key: "ctaLabel", label: "按钮文字", kind: "text" },
      { key: "ctaHref", label: "按钮链接", kind: "url" },
      { key: "showCta", label: "显示按钮", kind: "boolean" },
    ],
  }),
  define({
    type: "ABOUT_ENGINEERING",
    label: "关于 ZYRON · 技术与工程",
    group: "外贸业务",
    description: "主视觉、工程说明和四项技术能力图片卡片",
    defaultContent: aboutDefaultContent("ABOUT_ENGINEERING"),
    contentSchema: z.object({
      enabled: z.boolean(), eyebrow: shortText, title: shortText.min(1), highlight: shortText,
      paragraphs: z.array(text).min(1).max(6), statement: shortText, featureImage: mediaUrl,
      featureImageAlt: shortText.min(1), featureImageFocus: shortText,
      cards: z.array(aboutMediaCardSchema).min(1).max(8),
    }).strict(),
    editorFields: [
      { key: "enabled", label: "显示模块", kind: "boolean" },
      { key: "eyebrow", label: "品牌标签", kind: "text" },
      { key: "title", label: "主标题", kind: "text" },
      { key: "highlight", label: "绿色高亮文字", kind: "text" },
      { key: "paragraphs", label: "技术说明段落", kind: "list" },
      { key: "statement", label: "工程强调语", kind: "text" },
      { key: "featureImage", label: "主视觉图片（媒体库可替换）", kind: "url" },
      { key: "featureImageAlt", label: "主视觉替代文字", kind: "text" },
      { key: "featureImageFocus", label: "主视觉焦点", kind: "text" },
      { key: "cards", label: "技术能力（图片可单独替换、可增删排序）", kind: "json" },
    ],
  }),
  define({
    type: "ABOUT_GLOBAL_DELIVERY",
    label: "关于 ZYRON · 全球交付",
    group: "外贸业务",
    description: "全球项目支持、已核实能力数据和交付流程图片",
    defaultContent: aboutDefaultContent("ABOUT_GLOBAL_DELIVERY"),
    contentSchema: z.object({
      enabled: z.boolean(), eyebrow: shortText, titleLineOne: shortText.min(1), titleLineTwo: shortText.min(1),
      paragraphs: z.array(text).min(1).max(6), ctaLabel: shortText, ctaHref: url, showCta: z.boolean(),
      mapImage: mediaUrl.default("/images/about/zyron-global-delivery-map.png"),
      mapImageAlt: shortText.min(1).default("ZYRON global machinery project support and delivery network"),
      mapImageFocus: shortText.default("center"), mapAriaLabel: shortText.optional(),
      proofPoints: z.array(aboutStatSchema).min(1).max(6),
      deliveryEyebrow: shortText, deliveryTitle: shortText.min(1), deliveryDescription: text,
      itemLabel: shortText, items: z.array(aboutDeliveryCardSchema).min(1).max(8), viewAllLabel: shortText,
      viewAllHref: url, showViewAll: z.boolean(),
    }).strict(),
    editorFields: [
      { key: "enabled", label: "显示模块", kind: "boolean" },
      { key: "eyebrow", label: "品牌标签", kind: "text" },
      { key: "titleLineOne", label: "主标题第一行", kind: "text" },
      { key: "titleLineTwo", label: "主标题第二行", kind: "text" },
      { key: "paragraphs", label: "全球项目说明", kind: "list" },
      { key: "ctaLabel", label: "主按钮文字", kind: "text" },
      { key: "ctaHref", label: "主按钮链接", kind: "url" },
      { key: "showCta", label: "显示主按钮", kind: "boolean" },
      { key: "mapImage", label: "全球支持地图图片（媒体库可替换）", kind: "url" },
      { key: "mapImageAlt", label: "全球支持地图替代文字", kind: "text" },
      { key: "mapImageFocus", label: "全球支持地图焦点", kind: "text" },
      { key: "proofPoints", label: "已核实能力数据（可增删排序）", kind: "json" },
      { key: "deliveryEyebrow", label: "交付区品牌标签", kind: "text" },
      { key: "deliveryTitle", label: "交付区标题", kind: "text" },
      { key: "deliveryDescription", label: "交付区说明", kind: "textarea" },
      { key: "itemLabel", label: "交付项目编号标签", kind: "text" },
      { key: "items", label: "交付流程（图片可单独替换、可增删排序）", kind: "json" },
      { key: "viewAllLabel", label: "底部按钮文字", kind: "text" },
      { key: "viewAllHref", label: "底部按钮链接", kind: "url" },
      { key: "showViewAll", label: "显示底部按钮", kind: "boolean" },
    ],
  }),
  define({
    type: "ABOUT_QUOTE",
    label: "关于 ZYRON · 询价转化",
    group: "营销",
    description: "左侧品牌内容与右侧真实询盘表单",
    defaultContent: aboutDefaultContent("ABOUT_QUOTE"),
    contentSchema: z.object({
      enabled: z.boolean(), eyebrow: shortText, title: shortText.min(1), paragraphs: z.array(text).min(1).max(6),
      services: z.array(shortText.min(1)).min(1).max(8), image: mediaUrl, imageAlt: shortText.min(1),
      imageFocus: shortText, formEyebrow: shortText, formTitle: shortText.min(1), formDescription: text,
      privacyText: text, submitLabel: shortText.min(1),
    }).strict(),
    editorFields: [
      { key: "enabled", label: "显示模块", kind: "boolean" },
      { key: "eyebrow", label: "左侧品牌标签", kind: "text" },
      { key: "title", label: "左侧主标题", kind: "text" },
      { key: "paragraphs", label: "左侧说明段落", kind: "list" },
      { key: "services", label: "服务内容（可增删排序）", kind: "list" },
      { key: "image", label: "左侧图片（媒体库可替换）", kind: "url" },
      { key: "imageAlt", label: "图片替代文字", kind: "text" },
      { key: "imageFocus", label: "图片焦点", kind: "text" },
      { key: "formEyebrow", label: "表单品牌标签", kind: "text" },
      { key: "formTitle", label: "表单标题", kind: "text" },
      { key: "formDescription", label: "表单说明", kind: "textarea" },
      { key: "privacyText", label: "隐私说明", kind: "textarea" },
      { key: "submitLabel", label: "提交按钮文字", kind: "text" },
    ],
  }),
);

const registryByType = new Map(componentRegistry.map((definition) => [definition.type, definition]));

export function getComponentDefinition(type: string) {
  return registryByType.get(type as PageComponentType);
}
