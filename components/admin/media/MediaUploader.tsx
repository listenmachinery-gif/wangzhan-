"use client";

import { useState, type FormEvent } from "react";
import { Upload } from "lucide-react";

import type { MediaLibraryItem } from "@/components/admin/media/MediaLibrary";

export function MediaUploader({ onUploaded }: { onUploaded: (asset: MediaLibraryItem) => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = event.currentTarget;
    const response = await fetch("/api/admin/media", { method: "POST", body: new FormData(form) });
    const body = await response.json();
    if (response.ok) {
      onUploaded(body);
      form.reset();
      setMessage("上传成功");
    } else {
      setMessage(body.message ?? "上传失败，请检查文件。 ");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-5 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end">
      <label className="grid gap-2 text-sm font-medium">
        选择媒体文件
        <input name="file" type="file" required accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm" className="block w-full rounded-lg border border-neutral-300 p-2 text-sm" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        替代文本
        <input name="altText" placeholder="描述图片内容" className="rounded-lg border border-neutral-300 px-3 py-2" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        分类
        <input name="category" placeholder="例如：产品图" className="rounded-lg border border-neutral-300 px-3 py-2" />
      </label>
      <label className="grid gap-2 text-sm font-medium lg:col-span-3">
        用途
        <select name="usage" defaultValue="EDITORIAL_IMAGE" className="rounded-lg border border-neutral-300 px-3 py-2">
          <option value="EDITORIAL_IMAGE">内容图片（必须填写替代文本）</option>
          <option value="DECORATIVE_IMAGE">装饰图片</option>
          <option value="DOCUMENT">文档</option>
          <option value="VIDEO">视频</option>
        </select>
      </label>
      <button disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#76B900] px-4 text-sm font-semibold text-[#0B0D10] disabled:opacity-50">
        <Upload className="h-4 w-4" aria-hidden /> {busy ? "上传中…" : "上传文件"}
      </button>
      {message ? <p role="status" className="text-sm lg:col-span-4">{message}</p> : null}
    </form>
  );
}
