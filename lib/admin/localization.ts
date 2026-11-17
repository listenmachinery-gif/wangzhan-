const regionNames = new Intl.DisplayNames(["zh-CN"], { type: "region" });
const englishRegionNames = new Intl.DisplayNames(["en"], { type: "region" });

const englishCountryToCode = new Map<string, string>();
for (let first = 65; first <= 90; first += 1) {
  for (let second = 65; second <= 90; second += 1) {
    const code = String.fromCharCode(first, second);
    const name = englishRegionNames.of(code);
    if (name && name !== code && name !== "Unknown Region") englishCountryToCode.set(name.toLowerCase(), code);
  }
}

const alpha3CountryCodes: Readonly<Record<string, string>> = {
  AUS: "AU", BRA: "BR", CAN: "CA", CHN: "CN", DEU: "DE", ESP: "ES", FRA: "FR", GBR: "GB",
  IDN: "ID", IND: "IN", ITA: "IT", JPN: "JP", KOR: "KR", MEX: "MX", MYS: "MY", NLD: "NL",
  NZL: "NZ", PAK: "PK", POL: "PL", RUS: "RU", SAU: "SA", SGP: "SG", THA: "TH", TUR: "TR",
  TWN: "TW", UKR: "UA", USA: "US", VNM: "VN", ZAF: "ZA", ARE: "AE",
};

export const trafficSourceLabels: Readonly<Record<string, string>> = {
  direct: "直接访问",
  "(direct)": "直接访问",
  google: "Google",
  bing: "Bing",
  yahoo: "Yahoo",
  baidu: "百度",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  email: "邮件",
};

export const trafficMediumLabels: Readonly<Record<string, string>> = {
  none: "无媒介",
  "(none)": "无媒介",
  organic: "自然搜索",
  referral: "引荐访问",
  cpc: "按点击付费",
  ppc: "按点击付费",
  paid: "付费流量",
  paid_social: "付费社交媒体",
  social: "社交媒体",
  email: "邮件",
  display: "展示广告",
  affiliate: "联盟推广",
};

export const deviceTypeLabels: Readonly<Record<string, string>> = {
  desktop: "桌面端",
  mobile: "移动端",
  tablet: "平板",
};

export const adminEnumLabels: Readonly<Record<string, string>> = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  ARCHIVED: "已归档",
  ACTIVE: "启用",
  TOMBSTONED: "已停用",
  DELETED: "已删除",

  NEW: "新询盘",
  CONTACTED: "已联系",
  IN_DISCUSSION: "洽谈中",
  QUOTED: "已报价",
  WON: "已成交",
  LOST: "已流失",
  SPAM: "垃圾信息",
  WEBSITE_FORM: "官网表单",
  MANUAL: "手动录入",
  INTEGRATION: "系统集成",
  WEBSITE: "官网",
  EMAIL: "邮件",
  WHATSAPP: "WhatsApp",
  PHONE: "电话",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  TRADE_SHOW: "展会",
  REFERRAL: "客户推荐",
  OTHER: "其他",
  A: "A 级客户",
  B: "B 级客户",
  C: "C 级客户",
  D: "D 级客户",
  MEMBER: "成员",
  MANAGER: "经理",
  VIEWER: "查看员",
  NOTE: "备注",
  STATUS_CHANGE: "状态变更",
  ASSIGNMENT: "负责人变更",
  FOLLOW_UP: "跟进",

  OPEN: "开启",
  PENDING: "待处理",
  CLOSED: "已关闭",
  VISITOR: "访客",
  AGENT: "客服",
  SYSTEM: "系统",
  TEXT: "文本",
  SENT: "已发送",
  FAILED: "失败",

  SUPER_ADMIN: "超级管理员",
  ADMIN: "管理员",
  PRODUCT_EDITOR: "产品编辑",
  CONTENT_EDITOR: "内容编辑",
  SALES: "销售人员",
  SALES_MANAGER: "销售经理",
  CRM_VIEWER: "CRM 查看员",
  SUPPORT_AGENT: "客服专员",
  SUPPORT_SUPERVISOR: "客服主管",

  HOME: "首页",
  ABOUT: "关于我们",
  PRODUCT_INDEX: "产品中心",
  CATEGORY: "产品分类",
  PRODUCT: "产品详情",
  FACTORY: "工厂展示",
  CASES: "客户案例",
  NEWS: "新闻资讯",
  CONTACT: "联系我们",
  LANDING: "落地页",
  CUSTOM: "自定义页面",

  EDITORIAL_IMAGE: "内容图片",
  DECORATIVE_IMAGE: "装饰图片",
  DOCUMENT: "文档",
  VIDEO: "视频",
  COVER: "封面",
  LOADING: "装柜现场",
  EQUIPMENT: "发货设备",
  NUMBER: "数值",
  LEFT: "左对齐",
  CENTER: "居中",
  RIGHT: "右对齐",

  DEVELOPMENT: "开发环境",
  TEST: "测试环境",
  PREVIEW: "预览环境",
  PRODUCTION: "生产环境",
  PRODUCT_VIEW: "查看产品",
  INQUIRY_START: "开始询盘",
  INQUIRY_SUBMIT: "提交询盘",
  WHATSAPP_CLICK: "点击 WhatsApp",
  EMAIL_CLICK: "点击邮件",
  CATALOG_DOWNLOAD: "下载目录",
  CHAT_STARTED: "发起在线聊天",
  CHAT_MESSAGE_SENT: "发送聊天消息",

  CREATE: "创建",
  SAVE: "保存",
  UPDATE: "更新",
  PUBLISH: "发布",
  RESTORE: "恢复",
  ROLLBACK: "回滚",
  ARCHIVE: "归档",
};

const mediaReferenceEntityLabels: Readonly<Record<string, string>> = {
  Product: "产品",
  ProductSection: "产品模块",
  ProductCategory: "产品分类",
  Banner: "首页 Banner",
  SitePage: "页面",
  SeoRecord: "SEO 记录",
};

const mediaReferenceFieldLabels: Readonly<Record<string, string>> = {
  hero: "首图",
  image: "图片",
  desktop: "桌面端图片",
  tablet: "平板图片",
  mobile: "手机图片",
  desktopMediaId: "桌面端媒体",
  tabletMediaId: "平板媒体",
  mobileMediaId: "手机媒体",
  openGraphMediaId: "Open Graph 图片",
};

function clean(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export function formatCountryName(value: string | null | undefined, fallback = "未知"): string {
  const original = clean(value);
  if (!original) return fallback;
  const upper = original.toUpperCase();
  const code = /^[a-z]{2}$/i.test(original)
    ? upper
    : alpha3CountryCodes[upper] ?? englishCountryToCode.get(original.toLowerCase());
  if (!code) return original;
  const localized = regionNames.of(code);
  return localized && localized !== code && localized !== "未知地区" ? localized : original;
}

export function formatTrafficSource(value: string | null | undefined, fallback = "未知"): string {
  const original = clean(value);
  if (!original) return fallback;
  return trafficSourceLabels[original.toLowerCase()] ?? original;
}

export function formatTrafficMedium(value: string | null | undefined, fallback = "未知"): string {
  const original = clean(value);
  if (!original) return fallback;
  return trafficMediumLabels[original.toLowerCase()] ?? original;
}

export function formatDeviceType(value: string | null | undefined, fallback = "未知"): string {
  const original = clean(value);
  if (!original) return fallback;
  return deviceTypeLabels[original.toLowerCase()] ?? original;
}

export function formatAdminEnum(value: string | null | undefined, fallback = "未知"): string {
  const original = clean(value);
  if (!original) return fallback;
  return adminEnumLabels[original.toUpperCase()] ?? original;
}

export function formatMediaReferenceEntity(value: string | null | undefined, fallback = "未知内容"): string {
  const original = clean(value);
  if (!original) return fallback;
  return mediaReferenceEntityLabels[original] ?? original;
}

export function formatMediaReferenceField(value: string | null | undefined, fallback = "未知位置"): string {
  const original = clean(value);
  if (!original) return fallback;
  return mediaReferenceFieldLabels[original] ?? original;
}
