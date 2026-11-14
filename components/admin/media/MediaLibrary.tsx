"use client";

import { useState } from "react";
import { Eye, Search, Trash2 } from "lucide-react";
import Image from "next/image";

import { MediaUploader } from "@/components/admin/media/MediaUploader";

export type MediaLibraryItem = {
  id: string;
  originalName: string;
  mimeType: string;
  byteSize: number;
  altText: string | null;
  category: string | null;
  previewUrl: string | null;
  _count: { references: number };
};

type Reference = { entityType: string; entityId: string; field: string };

export function MediaLibrary({ initialItems, canDelete }: { initialItems: MediaLibraryItem[]; canDelete: boolean }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MediaLibraryItem | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  async function search() {
    const response = await fetch(`/api/admin/media?query=${encodeURIComponent(query)}`);
    const body = await response.json();
    if (response.ok) setItems(body.items);
  }

  async function openPreview(item: MediaLibraryItem) {
    const response = await fetch(`/api/admin/media/${item.id}`);
    const body = await response.json();
    setReferences(response.ok ? body.references : []);
    setSelected(item);
    setNotice(null);
  }

  async function saveAlt() {
    if (!selected) return;
    const response = await fetch(`/api/admin/media/${selected.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ altText: selected.altText }),
    });
    const body = await response.json();
    if (response.ok) {
      setItems((current) => current.map((item) => (item.id === selected.id ? { ...item, altText: body.altText } : item)));
      setNotice("替代文本已保存");
    } else setNotice("保存失败");
  }

  async function remove() {
    if (!selected) return;
    const response = await fetch(`/api/admin/media/${selected.id}`, { method: "DELETE" });
    const body = await response.json();
    if (response.ok) {
      setItems((current) => current.filter((item) => item.id !== selected.id));
      setSelected(null);
    } else if (response.status === 409) {
      setReferences(body.references);
      setNotice(`该资源正在被 ${body.references.length} 处内容引用，无法删除。`);
    } else setNotice("删除失败");
  }

  return (
    <div className="space-y-5">
      <MediaUploader onUploaded={(asset) => setItems((current) => [asset, ...current])} />
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="media-search">搜索媒体</label>
        <input id="media-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="按文件名、替代文本或分类搜索" className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2" />
        <button type="button" onClick={search} className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium"><Search className="h-4 w-4" />搜索</button>
      </div>
      {items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex h-32 items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-500">
                {item.mimeType.startsWith("image/") && item.previewUrl ? <Image unoptimized width={320} height={128} src={item.previewUrl} alt={item.altText ?? ""} className="h-full w-full rounded-lg object-contain" /> : item.mimeType}
              </div>
              <p className="mt-3 truncate font-medium" title={item.originalName}>{item.originalName}</p>
              <p className="mt-1 text-xs text-neutral-500">{Math.ceil(item.byteSize / 1024)} KB · 引用 {item._count.references}</p>
              <button type="button" onClick={() => openPreview(item)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#4D7900]"><Eye className="h-4 w-4" />预览与编辑</button>
            </li>
          ))}
        </ul>
      ) : <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-500">暂无媒体资源</div>}
      {selected ? (
        <div role="dialog" aria-modal="true" aria-label="媒体预览" className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">媒体预览</h2><p className="mt-1 text-sm text-neutral-500">{selected.originalName}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="关闭预览" className="rounded-lg px-3 py-1 text-2xl">×</button></div>
            {selected.previewUrl && selected.mimeType.startsWith("image/") ? <Image unoptimized width={576} height={256} src={selected.previewUrl} alt={selected.altText ?? ""} className="mt-4 max-h-64 w-full rounded-lg bg-neutral-100 object-contain" /> : null}
            <label className="mt-5 grid gap-2 text-sm font-medium">替代文本<input aria-label="替代文本编辑" value={selected.altText ?? ""} onChange={(event) => setSelected({ ...selected, altText: event.target.value })} className="rounded-lg border border-neutral-300 px-3 py-2" /></label>
            {references.length ? <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm"><p className="font-semibold">引用警告</p>{references.map((reference) => <p key={`${reference.entityType}-${reference.entityId}-${reference.field}`}>{reference.entityType} / {reference.entityId} / {reference.field}</p>)}</div> : null}
            {notice ? <p role="status" className="mt-4 text-sm">{notice}</p> : null}
            <div className="mt-5 flex flex-wrap justify-between gap-3">{canDelete ? <button type="button" onClick={remove} className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"><Trash2 className="h-4 w-4" />删除资源</button> : <span /> }<button type="button" onClick={saveAlt} className="rounded-lg bg-[#76B900] px-4 py-2 text-sm font-semibold">保存替代文本</button></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
