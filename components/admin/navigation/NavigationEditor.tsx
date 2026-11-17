"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronDown, History, Plus, RotateCcw, Save, Send, Trash2 } from "lucide-react";

import type { NavigationNode, NavigationSnapshot } from "@/lib/navigation/schema";

type NavigationVersion = {
  id: string;
  version: number;
  action: string;
  createdAt: string;
  publishedAt: string | null;
  createdBy: { name: string; email: string };
};

type NavigationEditorProps = {
  initialDocument: NavigationSnapshot;
  version: number;
  status: string;
  versions: NavigationVersion[];
  canWrite?: boolean;
  canPublish?: boolean;
};

type RequestResult = {
  version: number;
  status: string;
  draftContent: NavigationSnapshot;
  publishedVersion?: number | null;
};

const inputClass = "h-10 w-full rounded-admin-sm border border-admin-border bg-white px-3 text-sm text-admin-ink outline-none transition focus:border-ignition focus:ring-2 focus:ring-ignition/15";

export function NavigationEditor({
  initialDocument,
  version: initialVersion,
  status: initialStatus,
  versions,
  canWrite = true,
  canPublish = true,
}: NavigationEditorProps) {
  const router = useRouter();
  const [document, setDocument] = useState(() => structuredClone(initialDocument));
  const [version, setVersion] = useState(initialVersion);
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const sequence = useRef(0);

  function newNode(kind: NavigationNode["kind"] = "LINK"): NavigationNode {
    sequence.current += 1;
    return {
      id: `nav-item-${Date.now()}-${sequence.current}`,
      kind,
      label: kind === "GROUP" ? "新下拉菜单" : "新菜单",
      href: kind === "GROUP" ? undefined : "/",
      visible: true,
      ...(kind === "GROUP" ? { children: [] } : {}),
    };
  }

  function updatePrimary(index: number, patch: Partial<NavigationNode>) {
    setDocument((current) => ({
      ...current,
      primary: current.primary.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function updateChild(parentIndex: number, childIndex: number, patch: Partial<NavigationNode>) {
    setDocument((current) => ({
      ...current,
      primary: current.primary.map((item, itemIndex) => itemIndex === parentIndex ? {
        ...item,
        children: (item.children ?? []).map((child, index) => index === childIndex ? { ...child, ...patch } : child),
      } : item),
    }));
  }

  function movePrimary(index: number, direction: -1 | 1) {
    setDocument((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.primary.length) return current;
      const primary = [...current.primary];
      [primary[index], primary[target]] = [primary[target], primary[index]];
      return { ...current, primary };
    });
  }

  function removePrimary(index: number) {
    setDocument((current) => ({ ...current, primary: current.primary.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function removeChild(parentIndex: number, childIndex: number) {
    setDocument((current) => ({
      ...current,
      primary: current.primary.map((item, itemIndex) => itemIndex === parentIndex ? {
        ...item,
        children: (item.children ?? []).filter((_, index) => index !== childIndex),
      } : item),
    }));
  }

  async function request(url: string, method: string, body: unknown, success: string) {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) throw new Error("版本冲突：其他管理员已更新导航，请刷新页面后核对再保存。");
        throw new Error(result.message ?? "操作失败，请稍后重试。");
      }
      const updated = result as RequestResult;
      setVersion(updated.version);
      setStatus(updated.status);
      setDocument(structuredClone(updated.draftContent));
      setMessage(success);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "操作失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm">
          <div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "PUBLISHED" ? "bg-lime-100 text-lime-800" : "bg-amber-100 text-amber-800"}`}>
                {status === "PUBLISHED" ? "已发布" : "草稿"}
              </span>
              <span className="text-sm text-admin-muted">当前版本 v{version}</span>
            </div>
            <p className="mt-2 text-sm text-admin-muted">修改先保存为草稿，只有点击发布后才会同步到官网所有导航位置。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canWrite ? (
              <button type="button" disabled={busy} onClick={() => void request("/api/admin/navigation", "PATCH", { version, document }, "草稿已保存")} className="inline-flex h-10 items-center gap-2 rounded-admin-sm border border-admin-border px-4 text-sm font-semibold text-admin-ink transition hover:border-neutral-400 disabled:opacity-50">
                <Save className="size-4" aria-hidden />保存草稿
              </button>
            ) : null}
            {canPublish ? (
              <button type="button" disabled={busy} onClick={() => void request("/api/admin/navigation/publish", "POST", { version }, "导航已发布到前台")} className="inline-flex h-10 items-center gap-2 rounded-admin-sm bg-ignition px-4 text-sm font-semibold text-white transition hover:bg-neon disabled:opacity-50">
                <Send className="size-4" aria-hidden />发布到前台
              </button>
            ) : null}
          </div>
        </div>

        {error ? <p role="alert" className="rounded-admin-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
        {message ? <p role="status" className="rounded-admin-sm border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800">{message}</p> : null}

        <div className="rounded-admin-lg border border-admin-border bg-white shadow-admin-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border px-5 py-4">
            <div>
              <h2 className="font-semibold text-admin-ink">主导航结构</h2>
              <p className="mt-1 text-xs text-admin-muted">使用上移和下移调整顺序，所有操作均支持键盘。</p>
            </div>
            {canWrite ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => setDocument((current) => ({ ...current, primary: [...current.primary, newNode()] }))} className="inline-flex h-9 items-center gap-1.5 rounded-admin-sm border border-admin-border px-3 text-sm font-semibold"><Plus className="size-4" />新增一级链接</button>
                <button type="button" onClick={() => setDocument((current) => ({ ...current, primary: [...current.primary, newNode("GROUP")] }))} className="inline-flex h-9 items-center gap-1.5 rounded-admin-sm border border-admin-border px-3 text-sm font-semibold"><ChevronDown className="size-4" />新增下拉菜单</button>
              </div>
            ) : null}
          </div>
          <div className="divide-y divide-admin-border">
            {document.primary.map((node, index) => (
              <div key={node.id} data-testid="primary-navigation-item" className="p-5">
                <div className="grid gap-4 lg:grid-cols-[40px_minmax(160px,1fr)_minmax(180px,1.2fr)_130px_auto] lg:items-end">
                  <span className="grid size-10 place-items-center rounded-admin-sm bg-admin-canvas text-sm font-semibold text-admin-muted">{index + 1}</span>
                  <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">名称
                    <input aria-label={node.label ? `${node.label} 名称` : `菜单 ${index + 1} 名称`} value={node.label} disabled={!canWrite} onChange={(event) => updatePrimary(index, { label: event.target.value })} className={inputClass} />
                  </label>
                  <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">链接
                    <input aria-label={`${node.label || `菜单 ${index + 1}`} 链接`} value={node.href ?? ""} disabled={!canWrite} onChange={(event) => updatePrimary(index, { href: event.target.value || undefined })} placeholder="/contact" className={inputClass} />
                  </label>
                  <label className="grid gap-1.5 text-xs font-semibold text-admin-muted">类型
                    <select aria-label={`${node.label || `菜单 ${index + 1}`} 类型`} value={node.kind} disabled={!canWrite || node.kind === "PRODUCT_DIRECTORY"} onChange={(event) => updatePrimary(index, { kind: event.target.value as NavigationNode["kind"], children: event.target.value === "GROUP" ? node.children ?? [] : undefined })} className={inputClass}>
                      <option value="LINK">普通链接</option><option value="GROUP">下拉菜单</option><option value="PRODUCT_DIRECTORY">产品目录</option>
                    </select>
                  </label>
                  <div className="flex items-center justify-end gap-1">
                    <label className="mr-2 inline-flex items-center gap-2 text-xs font-semibold text-admin-muted"><input type="checkbox" aria-label={`${node.label || `菜单 ${index + 1}`} 显示`} checked={node.visible} disabled={!canWrite} onChange={(event) => updatePrimary(index, { visible: event.target.checked })} />显示</label>
                    <IconButton label={`上移 ${node.label}`} disabled={!canWrite || index === 0} onClick={() => movePrimary(index, -1)}><ArrowUp /></IconButton>
                    <IconButton label={`下移 ${node.label}`} disabled={!canWrite || index === document.primary.length - 1} onClick={() => movePrimary(index, 1)}><ArrowDown /></IconButton>
                    <IconButton label={`删除 ${node.label}`} disabled={!canWrite || node.kind === "PRODUCT_DIRECTORY"} onClick={() => removePrimary(index)} destructive><Trash2 /></IconButton>
                  </div>
                </div>

                {node.kind === "GROUP" ? (
                  <div className="mt-4 space-y-3 border-l-2 border-ignition/30 pl-4">
                    {(node.children ?? []).map((child, childIndex) => (
                      <div key={child.id} className="grid gap-3 rounded-admin-sm bg-admin-canvas p-3 sm:grid-cols-[minmax(140px,1fr)_minmax(180px,1.2fr)_auto] sm:items-end">
                        <label className="grid gap-1 text-xs font-semibold text-admin-muted">子菜单名称
                          <input aria-label={`${node.label} 子菜单 ${childIndex + 1} 名称`} value={child.label} disabled={!canWrite} onChange={(event) => updateChild(index, childIndex, { label: event.target.value })} className={inputClass} />
                        </label>
                        <label className="grid gap-1 text-xs font-semibold text-admin-muted">子菜单链接
                          <input aria-label={`${node.label} 子菜单 ${childIndex + 1} 链接`} value={child.href ?? ""} disabled={!canWrite} onChange={(event) => updateChild(index, childIndex, { href: event.target.value })} className={inputClass} />
                        </label>
                        <div className="flex items-center gap-2 pb-1">
                          <label className="inline-flex items-center gap-2 text-xs font-semibold text-admin-muted"><input type="checkbox" checked={child.visible} disabled={!canWrite} onChange={(event) => updateChild(index, childIndex, { visible: event.target.checked })} />显示</label>
                          <IconButton label={`删除 ${child.label}`} disabled={!canWrite} onClick={() => removeChild(index, childIndex)} destructive><Trash2 /></IconButton>
                        </div>
                      </div>
                    ))}
                    {canWrite ? <button type="button" aria-label={`为 ${node.label} 新增子项`} onClick={() => updatePrimary(index, { children: [...(node.children ?? []), newNode()] })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ignition"><Plus className="size-4" />新增子菜单</button> : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm">
          <div>
            <h2 className="font-semibold text-admin-ink">报价与语言入口</h2>
            <p className="mt-1 text-xs text-admin-muted">控制桌面端和移动端的报价按钮与语言菜单。</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-admin-sm border border-admin-border p-4">
              <p className="text-sm font-semibold text-admin-ink">报价按钮</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-semibold text-admin-muted">名称
                  <input aria-label="报价按钮名称" value={document.quote.label} disabled={!canWrite} onChange={(event) => setDocument((current) => ({ ...current, quote: { ...current.quote, label: event.target.value } }))} className={inputClass} />
                </label>
                <label className="grid gap-1 text-xs font-semibold text-admin-muted">链接
                  <input aria-label="报价按钮链接" value={document.quote.href ?? ""} disabled={!canWrite} onChange={(event) => setDocument((current) => ({ ...current, quote: { ...current.quote, href: event.target.value } }))} className={inputClass} />
                </label>
              </div>
              <label className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-admin-muted"><input type="checkbox" checked={document.quote.visible} disabled={!canWrite} onChange={(event) => setDocument((current) => ({ ...current, quote: { ...current.quote, visible: event.target.checked } }))} />显示报价按钮</label>
            </div>

            <div className="rounded-admin-sm border border-admin-border p-4">
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-admin-ink">语言菜单</p>{canWrite ? <button type="button" onClick={() => setDocument((current) => ({ ...current, languages: [...current.languages, { id: `language-${Date.now()}`, label: "新语言", locale: "en", href: "/", visible: true }] }))} className="inline-flex items-center gap-1 text-xs font-semibold text-ignition"><Plus className="size-3.5" />新增语言</button> : null}</div>
              <div className="mt-3 space-y-3">
                {document.languages.map((language, index) => (
                  <div key={language.id} className="grid gap-2 sm:grid-cols-[1fr_80px_1fr_auto] sm:items-end">
                    <label className="grid gap-1 text-xs font-semibold text-admin-muted">名称<input aria-label={`语言 ${index + 1} 名称`} value={language.label} disabled={!canWrite} onChange={(event) => setDocument((current) => ({ ...current, languages: current.languages.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) }))} className={inputClass} /></label>
                    <label className="grid gap-1 text-xs font-semibold text-admin-muted">语言码<input aria-label={`语言 ${index + 1} 语言码`} value={language.locale} disabled={!canWrite} onChange={(event) => setDocument((current) => ({ ...current, languages: current.languages.map((item, itemIndex) => itemIndex === index ? { ...item, locale: event.target.value } : item) }))} className={inputClass} /></label>
                    <label className="grid gap-1 text-xs font-semibold text-admin-muted">链接<input aria-label={`语言 ${index + 1} 链接`} value={language.href} disabled={!canWrite} onChange={(event) => setDocument((current) => ({ ...current, languages: current.languages.map((item, itemIndex) => itemIndex === index ? { ...item, href: event.target.value } : item) }))} className={inputClass} /></label>
                    <IconButton label={`删除语言 ${language.label}`} disabled={!canWrite} onClick={() => setDocument((current) => ({ ...current, languages: current.languages.filter((_, itemIndex) => itemIndex !== index) }))} destructive><Trash2 /></IconButton>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-semibold text-admin-ink">页脚导航</h2><p className="mt-1 text-xs text-admin-muted">管理官网底部的分组与链接；隐私政策固定保留在法律信息栏。</p></div>
            {canWrite ? <button type="button" onClick={() => setDocument((current) => ({ ...current, footerGroups: [...current.footerGroups, { id: `footer-group-${Date.now()}`, label: "新分组", items: [] }] }))} className="inline-flex h-9 items-center gap-1.5 rounded-admin-sm border border-admin-border px-3 text-sm font-semibold"><Plus className="size-4" />新增页脚分组</button> : null}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {document.footerGroups.map((group, groupIndex) => (
              <article key={group.id} className="rounded-admin-sm border border-admin-border p-4">
                <div className="flex items-end gap-2">
                  <label className="grid flex-1 gap-1 text-xs font-semibold text-admin-muted">分组名称<input aria-label={`页脚组 ${groupIndex + 1} 名称`} value={group.label} disabled={!canWrite} onChange={(event) => setDocument((current) => ({ ...current, footerGroups: current.footerGroups.map((item, itemIndex) => itemIndex === groupIndex ? { ...item, label: event.target.value } : item) }))} className={inputClass} /></label>
                  <IconButton label={`删除页脚分组 ${group.label}`} disabled={!canWrite} onClick={() => setDocument((current) => ({ ...current, footerGroups: current.footerGroups.filter((_, itemIndex) => itemIndex !== groupIndex) }))} destructive><Trash2 /></IconButton>
                </div>
                <div className="mt-3 space-y-3">
                  {group.items.map((item, itemIndex) => (
                    <div key={item.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                      <label className="grid gap-1 text-xs font-semibold text-admin-muted">链接名称<input aria-label={`页脚组 ${groupIndex + 1} 链接 ${itemIndex + 1} 名称`} value={item.label} disabled={!canWrite} onChange={(event) => setDocument((current) => ({ ...current, footerGroups: current.footerGroups.map((footerGroup, footerIndex) => footerIndex === groupIndex ? { ...footerGroup, items: footerGroup.items.map((link, linkIndex) => linkIndex === itemIndex ? { ...link, label: event.target.value } : link) } : footerGroup) }))} className={inputClass} /></label>
                      <label className="grid gap-1 text-xs font-semibold text-admin-muted">链接地址<input aria-label={`页脚组 ${groupIndex + 1} 链接 ${itemIndex + 1} 地址`} value={item.href ?? ""} disabled={!canWrite} onChange={(event) => setDocument((current) => ({ ...current, footerGroups: current.footerGroups.map((footerGroup, footerIndex) => footerIndex === groupIndex ? { ...footerGroup, items: footerGroup.items.map((link, linkIndex) => linkIndex === itemIndex ? { ...link, href: event.target.value } : link) } : footerGroup) }))} className={inputClass} /></label>
                      <IconButton label={`删除页脚链接 ${item.label}`} disabled={!canWrite} onClick={() => setDocument((current) => ({ ...current, footerGroups: current.footerGroups.map((footerGroup, footerIndex) => footerIndex === groupIndex ? { ...footerGroup, items: footerGroup.items.filter((_, linkIndex) => linkIndex !== itemIndex) } : footerGroup) }))} destructive><Trash2 /></IconButton>
                    </div>
                  ))}
                </div>
                {canWrite ? <button type="button" onClick={() => setDocument((current) => ({ ...current, footerGroups: current.footerGroups.map((footerGroup, footerIndex) => footerIndex === groupIndex ? { ...footerGroup, items: [...footerGroup.items, newNode()] } : footerGroup) }))} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ignition"><Plus className="size-3.5" />新增页脚链接</button> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <aside className="h-fit rounded-admin-lg border border-admin-border bg-white p-5 shadow-admin-sm xl:sticky xl:top-24">
        <div className="flex items-center gap-2"><History className="size-5 text-ignition" /><h2 className="font-semibold text-admin-ink">版本历史</h2></div>
        <p className="mt-2 text-xs leading-5 text-admin-muted">回滚会把历史内容恢复为新草稿，不会立即覆盖官网。</p>
        <div className="mt-4 space-y-3">
          {versions.length === 0 ? <p className="rounded-admin-sm bg-admin-canvas p-4 text-sm text-admin-muted">尚无历史版本</p> : versions.map((item) => (
            <article key={item.id} className="rounded-admin-sm border border-admin-border p-3">
              <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">v{item.version} · {formatAction(item.action)}</p><p className="mt-1 text-xs text-admin-muted">{formatDate(item.createdAt)}</p></div>{canWrite && item.version !== version ? <button type="button" aria-label={`回滚到版本 ${item.version}`} disabled={busy} onClick={() => void request("/api/admin/navigation/rollback", "POST", { version, targetVersion: item.version }, "历史版本已恢复为新草稿")} className="inline-flex items-center gap-1 text-xs font-semibold text-ignition"><RotateCcw className="size-3.5" />回滚</button> : null}</div>
              <p className="mt-2 truncate text-xs text-admin-muted">{item.createdBy.name || item.createdBy.email}</p>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

function IconButton({ label, disabled, onClick, destructive, children }: { label: string; disabled?: boolean; onClick: () => void; destructive?: boolean; children: React.ReactElement<{ className?: string }> }) {
  return <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className={`grid size-9 place-items-center rounded-admin-sm transition disabled:opacity-30 ${destructive ? "text-red-600 hover:bg-red-50" : "text-admin-muted hover:bg-admin-canvas hover:text-admin-ink"}`}>{children}</button>;
}

function formatAction(action: string) {
  return ({ CREATE: "创建", SAVE: "保存", PUBLISH: "发布", ROLLBACK: "回滚" } as Record<string, string>)[action] ?? action;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
