"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BannerSlide, type BannerPreviewViewport } from "@/components/site/HomeBannerCarousel";
import type { PublicBanner, PublicBannerMedia } from "@/lib/repositories/banner-repository";

type MediaOption = { id: string; originalName: string; altText: string | null; mimeType: string };
type BannerState = {
  id?: string;
  name: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  textColor: string | null;
  textPosition: "LEFT" | "CENTER" | "RIGHT" | null;
  maskOpacity: number | null;
  desktopMediaId: string;
  tabletMediaId: string | null;
  mobileMediaId: string | null;
  enabled: boolean;
  position: number;
  startsAt: string | null;
  endsAt: string | null;
  status: string;
  version: number;
};

const emptyBanner: BannerState = {
  name: "", title: "", subtitle: null, buttonText: null, buttonUrl: null,
  textColor: "#ffffff", textPosition: "CENTER", maskOpacity: 50,
  desktopMediaId: "", tabletMediaId: null, mobileMediaId: null,
  enabled: true, position: 0, startsAt: null, endsAt: null, status: "DRAFT", version: 1,
};

function dateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function isoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function BannerEditor({ initialBanner, media }: { initialBanner: BannerState | null; media: MediaOption[] }) {
  const router = useRouter();
  const [banner, setBanner] = useState<BannerState>(initialBanner ?? emptyBanner);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [previewViewport, setPreviewViewport] = useState<BannerPreviewViewport>("desktop");
  const selectedDesktop = media.find(({ id }) => id === banner.desktopMediaId) ?? null;
  const selectedTablet = media.find(({ id }) => id === banner.tabletMediaId) ?? selectedDesktop;
  const selectedMobile = media.find(({ id }) => id === banner.mobileMediaId) ?? selectedTablet;

  function previewMedia(asset: MediaOption | null): PublicBannerMedia | null {
    if (!asset) return null;
    return {
      url: `/api/media/${asset.id}`,
      alt: asset.altText || asset.originalName,
      kind: asset.mimeType.startsWith("video/") ? "VIDEO" : "IMAGE",
      mimeType: asset.mimeType,
    };
  }
  const desktopPreview = previewMedia(selectedDesktop);
  const tabletPreview = previewMedia(selectedTablet);
  const mobilePreview = previewMedia(selectedMobile);
  const previewBanner: PublicBanner | null = desktopPreview && tabletPreview && mobilePreview ? {
    id: banner.id ?? "draft-preview",
    title: banner.title || "Banner 标题预览",
    subtitle: banner.subtitle,
    buttonText: banner.buttonText,
    buttonUrl: banner.buttonUrl,
    textColor: banner.textColor || "#ffffff",
    textPosition: banner.textPosition ?? "CENTER",
    maskOpacity: banner.maskOpacity ?? 50,
    desktop: desktopPreview,
    tablet: tabletPreview,
    mobile: mobilePreview,
  } : null;

  async function request(url: string, options: RequestInit) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(url, { ...options, headers: { "content-type": "application/json", ...options.headers } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "操作失败。");
      setBanner(result);
      return result as BannerState;
    } finally {
      setBusy(false);
    }
  }

  function payload() {
    return {
      name: banner.name,
      title: banner.title,
      subtitle: banner.subtitle || null,
      buttonText: banner.buttonText || null,
      buttonUrl: banner.buttonUrl || null,
      textColor: banner.textColor || null,
      textPosition: banner.textPosition,
      maskOpacity: banner.maskOpacity,
      desktopMediaId: banner.desktopMediaId,
      tabletMediaId: banner.tabletMediaId || null,
      mobileMediaId: banner.mobileMediaId || null,
      enabled: banner.enabled,
      position: Number(banner.position),
      startsAt: banner.startsAt ? isoOrNull(dateTimeLocal(banner.startsAt)) : null,
      endsAt: banner.endsAt ? isoOrNull(dateTimeLocal(banner.endsAt)) : null,
    };
  }

  async function save() {
    try {
      const result = banner.id
        ? await request(`/api/admin/banners/${banner.id}`, { method: "PATCH", body: JSON.stringify({ version: banner.version, ...payload() }) })
        : await request("/api/admin/banners", { method: "POST", body: JSON.stringify(payload()) });
      setMessage("Banner 草稿已保存。");
      if (!banner.id) router.replace(`/admin/banners/${result.id}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败。");
    }
  }

  async function publish() {
    if (!banner.id) return;
    try {
      await request(`/api/admin/banners/${banner.id}/publish`, { method: "POST", body: JSON.stringify({ version: banner.version }) });
      setMessage("Banner 已发布，首页已刷新。"); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "发布失败。"); }
  }

  async function archive() {
    if (!banner.id) return;
    try {
      await request(`/api/admin/banners/${banner.id}`, { method: "DELETE", body: JSON.stringify({ version: banner.version }) });
      setMessage("Banner 已归档。"); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "归档失败。"); }
  }

  const inputClass = "mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2";
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold text-[#5F9500]">首页内容</p><h1 className="mt-2 text-3xl font-semibold">{banner.id ? `编辑：${banner.name}` : "新建 Banner"}</h1><p className="mt-2 text-sm text-neutral-600">桌面图必选；平板和手机未设置时会依次回退到可用的大尺寸图片。</p></div>
      <section className="grid gap-6 rounded-xl border border-neutral-200 bg-white p-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">内部名称<input value={banner.name} onChange={(event) => setBanner({ ...banner, name: event.target.value })} className={inputClass} /></label>
          <label className="text-sm font-medium">排序<input type="number" min="0" value={banner.position} onChange={(event) => setBanner({ ...banner, position: Number(event.target.value) })} className={inputClass} /></label>
          <label className="text-sm font-medium sm:col-span-2">主标题<input value={banner.title} onChange={(event) => setBanner({ ...banner, title: event.target.value })} className={inputClass} /></label>
          <label className="text-sm font-medium sm:col-span-2">副标题<textarea rows={3} value={banner.subtitle ?? ""} onChange={(event) => setBanner({ ...banner, subtitle: event.target.value || null })} className={inputClass} /></label>
          <label className="text-sm font-medium">按钮文字<input value={banner.buttonText ?? ""} onChange={(event) => setBanner({ ...banner, buttonText: event.target.value || null })} className={inputClass} /></label>
          <label className="text-sm font-medium">按钮链接<input placeholder="/products 或 https://…" value={banner.buttonUrl ?? ""} onChange={(event) => setBanner({ ...banner, buttonUrl: event.target.value || null })} className={inputClass} /></label>
          <label className="text-sm font-medium">文字位置<select value={banner.textPosition ?? "CENTER"} onChange={(event) => setBanner({ ...banner, textPosition: event.target.value as BannerState["textPosition"] })} className={inputClass}><option value="LEFT">左</option><option value="CENTER">中</option><option value="RIGHT">右</option></select></label>
          <label className="text-sm font-medium">文字颜色<input type="color" value={banner.textColor ?? "#ffffff"} onChange={(event) => setBanner({ ...banner, textColor: event.target.value })} className={`${inputClass} h-11`} /></label>
          <label className="text-sm font-medium sm:col-span-2">遮罩透明度：{banner.maskOpacity ?? 50}%<input type="range" min="0" max="100" value={banner.maskOpacity ?? 50} onChange={(event) => setBanner({ ...banner, maskOpacity: Number(event.target.value) })} className="mt-3 w-full" /></label>
        </div>
        <div className="space-y-4">
          <MediaSelect label="桌面图片（必选）" value={banner.desktopMediaId} media={media} required onChange={(desktopMediaId) => setBanner({ ...banner, desktopMediaId })} />
          <MediaSelect label="平板图片（可选）" value={banner.tabletMediaId ?? ""} media={media} onChange={(tabletMediaId) => setBanner({ ...banner, tabletMediaId: tabletMediaId || null })} />
          <MediaSelect label="手机图片（可选）" value={banner.mobileMediaId ?? ""} media={media} onChange={(mobileMediaId) => setBanner({ ...banner, mobileMediaId: mobileMediaId || null })} />
          <div className="flex flex-wrap gap-2" aria-label="预览设备">
            {(["desktop", "tablet", "mobile"] as const).map((viewport) => <button key={viewport} type="button" aria-pressed={previewViewport === viewport} onClick={() => setPreviewViewport(viewport)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${previewViewport === viewport ? "border-[#76B900] bg-[#eef8df]" : "border-neutral-300"}`}>{viewport === "desktop" ? "桌面预览" : viewport === "tablet" ? "平板预览" : "手机预览"}</button>)}
          </div>
          {previewBanner ? <div data-draft-banner-preview data-viewport={previewViewport} className={`mx-auto overflow-hidden rounded-lg border bg-neutral-950 transition-all ${previewViewport === "mobile" ? "aspect-[9/16] w-full max-w-[260px]" : previewViewport === "tablet" ? "aspect-[4/3] w-full max-w-[520px]" : "aspect-[16/7] w-full"}`}><BannerSlide banner={previewBanner} previewViewport={previewViewport} /></div> : <div className="grid aspect-[16/7] place-items-center rounded-lg border border-dashed text-sm text-neutral-500">请选择桌面图片或视频以预览完整 Banner</div>}
        </div>
      </section>
      <section className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-6 sm:grid-cols-2">
        <label className="text-sm font-medium">开始时间（浏览器本地时间）<input type="datetime-local" value={dateTimeLocal(banner.startsAt)} onChange={(event) => setBanner({ ...banner, startsAt: isoOrNull(event.target.value) })} className={inputClass} /></label>
        <label className="text-sm font-medium">结束时间（浏览器本地时间）<input type="datetime-local" value={dateTimeLocal(banner.endsAt)} onChange={(event) => setBanner({ ...banner, endsAt: isoOrNull(event.target.value) })} className={inputClass} /></label>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={banner.enabled} onChange={(event) => setBanner({ ...banner, enabled: event.target.checked })} />启用展示</label>
        <p className="text-sm text-neutral-600 sm:text-right">{banner.status} · v{banner.version}</p>
      </section>
      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-5">
        <button type="button" disabled={busy} onClick={() => void save()} className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold disabled:opacity-50">保存</button>
        {banner.id ? <button type="button" disabled={busy} onClick={() => void publish()} className="rounded-lg bg-[#76B900] px-5 py-2.5 font-semibold disabled:opacity-50">发布到首页</button> : null}
        {banner.id ? <button type="button" disabled={busy || banner.status === "ARCHIVED"} onClick={() => void archive()} className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50">归档</button> : null}
        {message ? <p role="status" className="text-sm text-neutral-700">{message}</p> : null}
      </section>
    </div>
  );
}

function MediaSelect({ label, value, media, required, onChange }: { label: string; value: string; media: MediaOption[]; required?: boolean; onChange: (value: string) => void }) {
  return <label className="block text-sm font-medium">{label}<select value={value} required={required} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2"><option value="">{required ? "请选择" : "自动回退"}</option>{media.map((asset) => <option key={asset.id} value={asset.id}>{asset.mimeType.startsWith("video/") ? "视频 · " : "图片 · "}{asset.originalName}{asset.altText ? ` · ${asset.altText}` : ""}</option>)}</select></label>;
}
