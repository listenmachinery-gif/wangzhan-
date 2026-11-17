"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, History, Plus, Save, Send, Trash2 } from "lucide-react";

import { adminEnumLabels } from "@/lib/admin/localization";
import { countryOptionsZh } from "@/lib/shipping/countries";
import { validateShippingPublication, type ShippingBodyBlock, type ShippingHighlightDocument, type ShippingMediaItem } from "@/lib/shipping/schema";

type RecordState = { id: string; slug: string; status: string; version: number; publishedVersion: number | null; draftContent: ShippingHighlightDocument };
type Version = { id: string; version: number; action: string; createdAt: string; publishedAt: string | null; createdBy: { name: string; email: string } };
type Category = { id: string; slug: string; name: string };
type Product = { id: string; slug: string; name: string; categoryId: string };
type MediaAsset = { id: string; originalName: string; mimeType: string; altText: string | null };

const inputClass = "h-10 w-full rounded-admin-sm border border-admin-border bg-white px-3 text-sm text-admin-ink outline-none transition focus:border-ignition focus:ring-2 focus:ring-ignition/15";
const textareaClass = `${inputClass} h-auto min-h-24 py-2.5 leading-6`;
const emptyDocument: ShippingHighlightDocument = {
  title: "", summary: "", shipmentDate: "", countryCode: "", equipmentName: "", quantity: 1,
  body: [], coverMediaId: "", media: [], seoTitle: "", seoDescription: "",
};

function normalizeMedia(items: ShippingMediaItem[]) {
  return items.map((item, position) => ({ ...item, position }));
}

function messageFrom(result: { message?: string; details?: string[] }, fallback: string) {
  return [result.message ?? fallback, ...(result.details ?? [])].join(" ");
}

export function ShippingHighlightEditor({ initialRecord, categories, products, media, versions, initialMessage = "", canWrite = true, canPublish = true }: {
  initialRecord: RecordState | null;
  categories: Category[];
  products: Product[];
  media: MediaAsset[];
  versions: Version[];
  initialMessage?: string;
  canWrite?: boolean;
  canPublish?: boolean;
}) {
  const router = useRouter();
  const [record, setRecord] = useState<RecordState | null>(() => initialRecord ? structuredClone(initialRecord) : null);
  const [document, setDocument] = useState<ShippingHighlightDocument>(() => structuredClone(initialRecord?.draftContent ?? emptyDocument));
  const [slug, setSlug] = useState(initialRecord?.slug ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [archiveConfirmation, setArchiveConfirmation] = useState(false);
  const sequence = useRef(0);
  const availableProducts = useMemo(() => products.filter((product) => !document.categoryId || product.categoryId === document.categoryId), [document.categoryId, products]);

  function patchDocument(patch: Partial<ShippingHighlightDocument>) {
    setDocument((current) => ({ ...current, ...patch }));
  }

  function chooseCategory(categoryId: string) {
    const category = categories.find((item) => item.id === categoryId);
    patchDocument({ categoryId: category?.id, categorySlug: category?.slug, productId: undefined, productSlug: undefined });
  }

  function chooseProduct(productId: string) {
    const product = products.find((item) => item.id === productId);
    patchDocument({ productId: product?.id, productSlug: product?.slug });
  }

  function patchMedia(index: number, patch: Partial<ShippingMediaItem>) {
    setDocument((current) => ({ ...current, media: current.media.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  }

  function moveMedia(index: number, direction: -1 | 1) {
    setDocument((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.media.length) return current;
      const next = [...current.media];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, media: normalizeMedia(next) };
    });
  }

  function addMedia() {
    const asset = media.find((candidate) => !document.media.some((item) => item.mediaAssetId === candidate.id)) ?? media[0];
    if (!asset) return setError("媒体库暂无可用图片或视频，请先上传媒体资源。");
    sequence.current += 1;
    const isVideo = asset.mimeType.startsWith("video/");
    const item: ShippingMediaItem = {
      id: `shipping-media-${Date.now()}-${sequence.current}`,
      mediaAssetId: asset.id,
      role: isVideo ? "VIDEO" : document.media.some((entry) => entry.role === "COVER") ? "EQUIPMENT" : "COVER",
      position: document.media.length,
      altText: asset.altText ?? "",
    };
    setDocument((current) => ({ ...current, media: [...current.media, item], coverMediaId: item.role === "COVER" ? asset.id : current.coverMediaId }));
  }

  function updateBody(index: number, patch: Partial<ShippingBodyBlock>) {
    setDocument((current) => ({ ...current, body: current.body.map((block, itemIndex) => itemIndex === index ? { ...block, ...patch } as ShippingBodyBlock : block) }));
  }

  function applyResult(result: RecordState) {
    setRecord(structuredClone(result));
    setSlug(result.slug);
    setDocument(structuredClone(result.draftContent));
  }

  async function request(url: string, method: string, body: unknown, success: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json() as RecordState & { message?: string; details?: string[] };
      if (!response.ok) {
        if (response.status === 409) throw new Error("版本冲突：其他管理员已更新此发货内容。当前编辑不会丢失，请刷新页面核对后再保存。");
        throw new Error(messageFrom(result, "操作失败，请稍后重试。"));
      }
      applyResult(result);
      setMessage(success);
      setArchiveConfirmation(false);
      router.refresh();
      return result;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "操作失败，请稍后重试。");
      return null;
    } finally { setBusy(false); }
  }

  async function saveDraft() {
    if (!record) {
      const result = await request("/api/admin/shipping-highlights", "POST", { slug, document }, "草稿已创建");
      if (result) router.replace(`/admin/shipping-highlights/${result.id}?created=1`);
      return;
    }
    await request(`/api/admin/shipping-highlights/${record.id}`, "PATCH", { version: record.version, slug, document }, "草稿已保存");
  }

  async function publish() {
    setError(""); setMessage("");
    const quality = validateShippingPublication(document, media.map((asset) => ({ id: asset.id, lifecycleStatus: "ACTIVE", mimeType: asset.mimeType })));
    if (quality.blockers.length > 0) { setError(quality.blockers.join(" ")); return; }
    if (!record) { setError("请先保存草稿，再发布到前台。"); return; }
    await request(`/api/admin/shipping-highlights/${record.id}/publish`, "POST", { version: record.version }, quality.warnings.length ? `已发布到前台。优化建议：${quality.warnings.join(" ")}` : "已发布到前台");
  }

  async function rollback(targetVersion: number) {
    if (!record) return;
    await request(`/api/admin/shipping-highlights/${record.id}/rollback`, "POST", { version: record.version, targetVersion }, "历史版本已恢复为新草稿，线上内容未改变");
  }

  async function archive() {
    if (!record) return;
    await request(`/api/admin/shipping-highlights/${record.id}`, "DELETE", { version: record.version }, "发货内容已归档并从前台撤下");
  }

  const selectedCover = media.find((asset) => asset.id === document.coverMediaId);
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm">
          <div><div className="flex items-center gap-3"><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold">{adminEnumLabels[record?.status ?? "DRAFT"] ?? "草稿"}</span><span className="text-sm text-admin-muted">{record ? `当前版本 v${record.version}` : "尚未保存"}</span></div><p className="mt-2 text-sm text-admin-muted">保存只更新草稿；发布后官网才会显示最新内容。</p></div>
          <div className="flex flex-wrap gap-2">
            {canWrite ? <button type="button" disabled={busy} onClick={() => void saveDraft()} className="inline-flex h-10 items-center gap-2 rounded-admin-sm border border-admin-border px-4 text-sm font-semibold disabled:opacity-50"><Save className="size-4" />保存草稿</button> : null}
            {canPublish ? <button type="button" disabled={busy} onClick={() => void publish()} className="inline-flex h-10 items-center gap-2 rounded-admin-sm bg-ignition px-4 text-sm font-semibold text-white disabled:opacity-50"><Send className="size-4" />发布到前台</button> : null}
            {record && canPublish && !archiveConfirmation ? <button type="button" disabled={busy} onClick={() => setArchiveConfirmation(true)} className="h-10 rounded-admin-sm border border-red-200 px-4 text-sm font-semibold text-red-700">归档</button> : null}
            {archiveConfirmation ? <button type="button" disabled={busy} onClick={() => void archive()} className="h-10 rounded-admin-sm bg-red-700 px-4 text-sm font-semibold text-white">确认归档</button> : null}
          </div>
        </section>
        {error ? <p role="alert" className="rounded-admin-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
        {message ? <p role="status" className="rounded-admin-sm border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800">{message}</p> : null}

        <EditorSection title="基础信息" description="记录真实发货时间、客户国家和内容地址。">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="标题"><input aria-label="标题" value={document.title} onChange={(event) => patchDocument({ title: event.target.value })} className={inputClass} /></Field>
            <Field label="页面 Slug"><input aria-label="页面 Slug" value={slug} disabled={Boolean(record?.publishedVersion)} onChange={(event) => setSlug(event.target.value)} placeholder="germany-electric-shear-shipment" className={inputClass} /></Field>
            <Field label="发货日期"><input aria-label="发货日期" type="date" value={document.shipmentDate} onChange={(event) => patchDocument({ shipmentDate: event.target.value })} className={inputClass} /></Field>
            <Field label="国家或地区"><select aria-label="国家或地区" value={document.countryCode} onChange={(event) => patchDocument({ countryCode: event.target.value })} className={inputClass}><option value="">请选择</option>{countryOptionsZh.map((country) => <option key={country.value} value={country.value}>{country.label}</option>)}</select></Field>
            <Field label="城市"><input aria-label="城市" value={document.city ?? ""} onChange={(event) => patchDocument({ city: event.target.value || undefined })} className={inputClass} /></Field>
            <Field label="摘要"><textarea aria-label="摘要" value={document.summary} onChange={(event) => patchDocument({ summary: event.target.value })} className={textareaClass} /></Field>
          </div>
        </EditorSection>

        <EditorSection title="设备与关联产品" description="产品只能从当前分类中选择，避免错误关联。">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="产品分类"><select aria-label="产品分类" value={document.categoryId ?? ""} onChange={(event) => chooseCategory(event.target.value)} className={inputClass}><option value="">不关联分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
            <Field label="关联产品"><select aria-label="关联产品" value={document.productId ?? ""} onChange={(event) => chooseProduct(event.target.value)} className={inputClass}><option value="">不关联产品</option>{availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></Field>
            <Field label="设备名称"><input aria-label="设备名称" value={document.equipmentName} onChange={(event) => patchDocument({ equipmentName: event.target.value })} className={inputClass} /></Field>
            <Field label="型号"><input aria-label="型号" value={document.modelName ?? ""} onChange={(event) => patchDocument({ modelName: event.target.value || undefined })} className={inputClass} /></Field>
            <Field label="数量"><input aria-label="数量" type="number" min={1} value={document.quantity} onChange={(event) => patchDocument({ quantity: Number(event.target.value) || 1 })} className={inputClass} /></Field>
          </div>
        </EditorSection>

        <EditorSection title="物流与包装" description="补充装柜、运输和出口包装方式。">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="装柜方式"><input aria-label="装柜方式" value={document.containerMethod ?? ""} onChange={(event) => patchDocument({ containerMethod: event.target.value || undefined })} className={inputClass} /></Field>
            <Field label="运输方式"><input aria-label="运输方式" value={document.transportMode ?? ""} onChange={(event) => patchDocument({ transportMode: event.target.value || undefined })} className={inputClass} /></Field>
            <Field label="包装方式"><input aria-label="包装方式" value={document.packagingMethod ?? ""} onChange={(event) => patchDocument({ packagingMethod: event.target.value || undefined })} className={inputClass} /></Field>
          </div>
        </EditorSection>

        <EditorSection title="媒体画廊" description="为每张图片和视频填写中文替代文本；可用键盘操作的按钮调整顺序。" action={<button type="button" onClick={addMedia} className="inline-flex items-center gap-1.5 rounded-admin-sm border border-admin-border px-3 py-2 text-sm font-semibold"><Plus className="size-4" />添加媒体</button>}>
          <Field label="封面媒体"><select aria-label="封面媒体" value={document.coverMediaId} onChange={(event) => patchDocument({ coverMediaId: event.target.value })} className={inputClass}><option value="">请选择封面</option>{document.media.filter((item) => media.find((asset) => asset.id === item.mediaAssetId)?.mimeType.startsWith("image/")).map((item) => <option key={item.id} value={item.mediaAssetId}>{media.find((asset) => asset.id === item.mediaAssetId)?.originalName}</option>)}</select></Field>
          <div className="mt-4 space-y-3">
            {document.media.map((item, index) => <div key={item.id} data-testid="shipping-media-row" className="grid gap-3 rounded-admin-sm border border-admin-border bg-admin-canvas p-4 md:grid-cols-2">
              <Field label={`媒体 ${index + 1} 文件`}><select aria-label={`媒体 ${index + 1} 文件`} value={item.mediaAssetId} onChange={(event) => { const asset = media.find((candidate) => candidate.id === event.target.value); patchMedia(index, { mediaAssetId: event.target.value, role: asset?.mimeType.startsWith("video/") ? "VIDEO" : item.role === "VIDEO" ? "EQUIPMENT" : item.role, altText: item.altText || asset?.altText || "" }); }} className={inputClass}>{media.map((asset) => <option key={asset.id} value={asset.id}>{asset.originalName}</option>)}</select></Field>
              <Field label={`媒体 ${index + 1} 角色`}><select aria-label={`媒体 ${index + 1} 角色`} value={item.role} onChange={(event) => patchMedia(index, { role: event.target.value as ShippingMediaItem["role"] })} className={inputClass}><option value="COVER">封面</option><option value="LOADING">装柜</option><option value="EQUIPMENT">设备</option><option value="VIDEO">视频</option></select></Field>
              <Field label={`媒体 ${index + 1} 替代文本`}><input aria-label={`媒体 ${index + 1} 替代文本`} value={item.altText} onChange={(event) => patchMedia(index, { altText: event.target.value })} className={inputClass} /></Field>
              <Field label={`媒体 ${index + 1} 说明`}><input aria-label={`媒体 ${index + 1} 说明`} value={item.caption ?? ""} onChange={(event) => patchMedia(index, { caption: event.target.value || undefined })} className={inputClass} /></Field>
              <div className="flex gap-2 md:col-span-2"><IconButton label={`上移媒体 ${index + 1}`} disabled={index === 0} onClick={() => moveMedia(index, -1)}><ArrowUp /></IconButton><IconButton label={`下移媒体 ${index + 1}`} disabled={index === document.media.length - 1} onClick={() => moveMedia(index, 1)}><ArrowDown /></IconButton><IconButton label={`删除媒体 ${index + 1}`} onClick={() => setDocument((current) => ({ ...current, media: normalizeMedia(current.media.filter((_, itemIndex) => itemIndex !== index)), coverMediaId: current.coverMediaId === item.mediaAssetId ? "" : current.coverMediaId }))}><Trash2 /></IconButton></div>
            </div>)}
          </div>
        </EditorSection>

        <EditorSection title="正文结构" description="仅保存结构化标题、段落和安全链接，不接受原始 HTML。" action={<div className="flex gap-2"><button type="button" onClick={() => patchDocument({ body: [...document.body, { type: "PARAGRAPH", text: "" }] })} className="rounded-admin-sm border border-admin-border px-3 py-2 text-sm font-semibold">添加段落</button><button type="button" onClick={() => patchDocument({ body: [...document.body, { type: "HEADING", text: "" }] })} className="rounded-admin-sm border border-admin-border px-3 py-2 text-sm font-semibold">添加标题</button></div>}>
          <div className="space-y-3">{document.body.map((block, index) => <div key={`${block.type}-${index}`} className="rounded-admin-sm border border-admin-border p-4"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-admin-muted">{block.type === "PARAGRAPH" ? "段落" : block.type === "HEADING" ? "标题" : "链接"}</span><button type="button" aria-label={`删除正文模块 ${index + 1}`} onClick={() => patchDocument({ body: document.body.filter((_, itemIndex) => itemIndex !== index) })} className="text-red-700"><Trash2 className="size-4" /></button></div>{block.type === "PARAGRAPH" ? <textarea aria-label={`正文段落 ${index + 1}`} value={block.text} onChange={(event) => updateBody(index, { text: event.target.value })} className={textareaClass} /> : <input aria-label={`正文${block.type === "HEADING" ? "标题" : "链接文字"} ${index + 1}`} value={block.text} onChange={(event) => updateBody(index, { text: event.target.value })} className={inputClass} />}{block.type === "LINK" ? <input aria-label={`正文链接 ${index + 1}`} value={block.href} onChange={(event) => updateBody(index, { href: event.target.value })} className={`${inputClass} mt-2`} /> : null}</div>)}</div>
        </EditorSection>

        <EditorSection title="基础 SEO" description="标题和描述独立于页面正文，发布前会给出长度建议。">
          <div className="space-y-4"><Field label="SEO 标题"><input aria-label="SEO 标题" value={document.seoTitle} onChange={(event) => patchDocument({ seoTitle: event.target.value })} className={inputClass} /></Field><Field label="SEO 描述"><textarea aria-label="SEO 描述" value={document.seoDescription} onChange={(event) => patchDocument({ seoDescription: event.target.value })} className={textareaClass} /></Field></div>
        </EditorSection>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
        <section className="rounded-admin-lg border border-admin-border bg-graphite-950 p-5 text-white shadow-admin-sm"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neon">前台预览</p>{selectedCover ? <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-admin-sm bg-black"><Image src={`/api/media/${selectedCover.id}`} alt={document.media.find((item) => item.mediaAssetId === selectedCover.id)?.altText || document.title || "发货封面预览"} fill sizes="340px" className="object-cover" /></div> : null}<h2 className="mt-3 text-xl font-semibold">{document.title || "未命名发货内容"}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{document.summary || "填写摘要后，这里会显示前台内容概览。"}</p><dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-zinc-500">设备</dt><dd className="mt-1">{document.equipmentName || "未设置"}</dd></div><div><dt className="text-zinc-500">数量</dt><dd className="mt-1">{document.quantity} 台</dd></div><div><dt className="text-zinc-500">封面</dt><dd className="mt-1 truncate">{selectedCover?.originalName ?? "未设置"}</dd></div><div><dt className="text-zinc-500">媒体</dt><dd className="mt-1">{document.media.length} 项</dd></div></dl>{record?.publishedVersion ? <Link href={`/shipping-highlights/${record.slug}`} target="_blank" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-neon">查看线上页面<ExternalLink className="size-4" /></Link> : null}</section>
        <section className="rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm"><div className="flex items-center gap-2"><History className="size-4 text-ignition" /><h2 className="font-semibold text-admin-ink">版本历史</h2></div><div className="mt-4 space-y-3">{versions.length === 0 ? <p className="text-sm text-admin-muted">保存后将生成版本记录。</p> : versions.map((version) => <div key={version.id} className="rounded-admin-sm border border-admin-border p-3"><div className="flex items-center justify-between"><span className="text-sm font-semibold">v{version.version} · {version.action}</span><span className="text-xs text-admin-muted">{new Date(version.createdAt).toLocaleDateString("zh-CN")}</span></div><p className="mt-1 text-xs text-admin-muted">{version.createdBy.name}</p>{record && canWrite ? <button type="button" disabled={busy} aria-label={`回滚到版本 ${version.version}`} onClick={() => void rollback(version.version)} className="mt-2 text-xs font-semibold text-ignition">回滚到版本 {version.version}</button> : null}</div>)}</div></section>
      </aside>
    </div>
  );
}

function EditorSection({ title, description, action, children }: { title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-admin-lg border border-admin-border bg-white shadow-admin-sm"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-admin-border px-5 py-4"><div><h2 className="font-semibold text-admin-ink">{title}</h2><p className="mt-1 text-xs leading-5 text-admin-muted">{description}</p></div>{action}</div><div className="p-5">{children}</div></section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">{label}{children}</label>; }
function IconButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="grid size-9 place-items-center rounded-admin-sm border border-admin-border text-admin-muted disabled:opacity-30 [&_svg]:size-4">{children}</button>; }
