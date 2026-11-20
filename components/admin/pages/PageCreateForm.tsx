"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { defaultHomepageDocument } from "@/lib/page-builder/default-homepage";
import { emptyPageDocument } from "@/lib/page-builder/schema";
import { INDUSTRIAL_PAGE_TEMPLATES } from "@/lib/page-builder/industrial-templates";

type PageCreateDefaults = {
  name?: string;
  slug?: string;
  pageType?: string;
  template?: string;
};

export function PageCreateForm({ defaults = {} }: { defaults?: PageCreateDefaults }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setPending(true); setError("");
    const template = String(formData.get("template"));
    const response = await fetch("/api/admin/pages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: formData.get("name"), slug: formData.get("slug"), pageType: formData.get("pageType"), document: INDUSTRIAL_PAGE_TEMPLATES[template]?.document ?? (template === "homepage" ? defaultHomepageDocument : emptyPageDocument) }) });
    const body = await response.json();
    if (!response.ok) { setError(body.message ?? "创建失败，请检查输入。"); setPending(false); return; }
    router.push(`/admin/pages/${body.id}/edit`);
    router.refresh();
  }

  return <form action={submit} className="max-w-2xl space-y-5 rounded-xl border border-neutral-200 bg-white p-6"><label className="block"><span className="text-sm font-semibold">页面名称</span><input name="name" defaultValue={defaults.name} required minLength={2} className="mt-2 h-11 w-full rounded-lg border border-neutral-300 px-3" placeholder="Home" /></label><label className="block"><span className="text-sm font-semibold">Slug</span><input name="slug" defaultValue={defaults.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="mt-2 h-11 w-full rounded-lg border border-neutral-300 px-3" placeholder="home" /></label><label className="block"><span className="text-sm font-semibold">页面类型</span><select name="pageType" defaultValue={defaults.pageType ?? "HOME"} className="mt-2 h-11 w-full rounded-lg border border-neutral-300 px-3"><option value="HOME">首页</option><option value="ABOUT">关于我们</option><option value="PRODUCT_INDEX">产品中心</option><option value="CATEGORY">产品系列</option><option value="PRODUCT">产品详情</option><option value="FACTORY">工厂</option><option value="CASES">案例</option><option value="NEWS">新闻</option><option value="CONTACT">联系我们</option><option value="LANDING">落地页</option><option value="CUSTOM">自定义页面</option></select></label><fieldset><legend className="text-sm font-semibold">起始模板</legend><div className="mt-2 grid gap-3 sm:grid-cols-2"><label className="rounded-lg border border-neutral-300 p-4"><input type="radio" name="template" value="homepage" defaultChecked={(defaults.template ?? "homepage") === "homepage"} /> <span className="ml-2 font-semibold">首页两个现有模块</span><p className="mt-2 text-xs text-neutral-500">工厂实力与技术优势，保持现有内容。</p></label>{Object.entries(INDUSTRIAL_PAGE_TEMPLATES).map(([id, template]) => <label key={id} className="rounded-lg border border-neutral-300 p-4"><input type="radio" name="template" value={id} defaultChecked={defaults.template === id} /> <span className="ml-2 font-semibold">{template.label}</span><p className="mt-2 text-xs text-neutral-500">{template.document.nodes.length} 个可编辑模块</p></label>)}<label className="rounded-lg border border-neutral-300 p-4"><input type="radio" name="template" value="blank" defaultChecked={defaults.template === "blank"} /> <span className="ml-2 font-semibold">空白页面</span><p className="mt-2 text-xs text-neutral-500">从组件库逐个添加。</p></label></div></fieldset>{error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}<button disabled={pending} className="rounded-lg bg-[#76B900] px-5 py-3 text-sm font-semibold text-[#0B0D10] disabled:opacity-50">{pending ? "正在创建…" : "创建并打开设计器"}</button></form>;
}
