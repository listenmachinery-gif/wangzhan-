"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Film, FolderOpen, Image as ImageIcon, Search, X } from "lucide-react";

export type LibraryMediaKind = "image" | "video";

export type SelectedLibraryMedia = {
  id: string;
  url: string;
  altText: string;
  mimeType: string;
};

type MediaItem = {
  id: string;
  originalName: string;
  mimeType: string;
  altText: string | null;
  category: string | null;
  previewUrl: string | null;
};

type MediaResult = { items: MediaItem[]; nextCursor?: string | null; message?: string };

export function MediaAssetPicker({
  kind,
  onSelect,
  label = "从媒体资源库替换",
}: {
  kind: LibraryMediaKind;
  onSelect(asset: SelectedLibraryMedia): void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (search: string, nextCursor: string | null = null) => {
    setBusy(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "24", kind });
      if (search) params.set("query", search);
      if (nextCursor) params.set("cursor", nextCursor);
      const response = await fetch("/api/admin/media?" + params.toString(), { cache: "no-store" });
      const data = await response.json() as MediaResult;
      if (!response.ok) throw new Error(data.message || "无法读取媒体资源，请检查媒体读取权限。");
      setItems((current) => nextCursor ? [...current, ...data.items] : data.items);
      setCursor(data.nextCursor ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "媒体资源读取失败");
    } finally {
      setBusy(false);
    }
  }, [kind]);

  useEffect(() => {
    if (!open) return;
    void load("");
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = query.trim();
    setAppliedQuery(next);
    void load(next);
  }

  function choose(item: MediaItem) {
    // Persist a stable, site-relative media path, NEVER an expiring signed preview URL.
    // /api/media/[id] already redirects to a fresh storage URL on each request.
    onSelect({
      id: item.id,
      url: "/api/media/" + encodeURIComponent(item.id),
      altText: item.altText ?? "",
      mimeType: item.mimeType,
    });
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setQuery(""); setAppliedQuery(""); }}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold transition hover:border-[#76B900]"
      >
        <FolderOpen size={15} aria-hidden />
        {label}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={kind === "video" ? "选择媒体库视频" : "选择媒体库图片"}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/65 p-3"
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b p-4">
              <div>
                <h2 className="text-lg font-semibold">从媒体资源库选择{kind === "video" ? "视频" : "图片"}</h2>
                <p className="mt-1 text-xs text-neutral-500">选择后自动填写稳定媒体地址。不会改变原文件，也不会删除原有素材。</p>
              </div>
              <button type="button" aria-label="关闭媒体选择" onClick={() => setOpen(false)} className="rounded p-2 hover:bg-neutral-100">
                <X size={20} />
              </button>
            </header>
            <form onSubmit={onSearch} className="flex gap-2 border-b p-4">
              <label className="sr-only" htmlFor="page-media-search">搜索媒体</label>
              <input id="page-media-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文件名、分类、替代文字" className="min-w-0 flex-1 rounded border border-neutral-300 px-3 py-2 text-sm" />
              <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded bg-[#76B900] px-4 text-sm font-semibold disabled:opacity-50"><Search size={15} />搜索</button>
            </form>
            <div className="overflow-y-auto p-4">
              {error ? <p role="alert" className="mb-3 rounded border border-red-200 p-3 text-sm text-red-700">{error}</p> : null}
              {items.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((asset) => (
                    <button
                      type="button"
                      key={asset.id}
                      onClick={() => choose(asset)}
                      className="min-w-0 rounded border border-neutral-200 bg-white p-2 text-left transition hover:border-[#76B900] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#76B900]"
                    >
                      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded bg-neutral-100">
                        {asset.previewUrl && asset.mimeType.startsWith("image/") ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={asset.previewUrl} alt={asset.altText ?? asset.originalName} className="h-full w-full object-contain" />
                        ) : asset.previewUrl && asset.mimeType.startsWith("video/") ? (
                          <video src={asset.previewUrl} preload="metadata" muted playsInline className="h-full w-full object-contain" />
                        ) : kind === "image" ? <ImageIcon size={28} className="text-neutral-400" /> : <Film size={28} className="text-neutral-400" />}
                      </div>
                      <p className="mt-2 truncate text-xs font-semibold" title={asset.originalName}>{asset.originalName}</p>
                      <p className="truncate text-xs text-neutral-500">{asset.category ?? asset.mimeType}</p>
                    </button>
                  ))}
                </div>
              ) : !busy && !error ? <p className="py-16 text-center text-sm text-neutral-500">当前条件下没有可用素材。请先在“媒体资源”上传图片或视频。</p> : null}
              {busy ? <p role="status" className="py-4 text-center text-sm text-neutral-500">读取媒体资源中…</p> : null}
              {cursor && !busy ? (
                <button type="button" onClick={() => void load(appliedQuery, cursor)} className="mx-auto mt-6 block rounded border px-5 py-2 text-sm font-medium">加载更多</button>
              ) : null}
            </div>
            <footer className="border-t p-3 text-right text-xs text-neutral-500">选中素材后，在页面设计器中保存草稿并发布才能更新前台。</footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
