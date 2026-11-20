"use client";

import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Copy,
  History,
  Laptop,
  Monitor,
  Plus,
  Redo2,
  Save,
  Smartphone,
  Trash2,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PageRenderer } from "@/components/page-builder/PageRenderer";
import { INDUSTRIAL_PAGE_TEMPLATES } from "@/lib/page-builder/industrial-templates";
import { formatAdminEnum } from "@/lib/admin/localization";
import {
  componentRegistry,
  getComponentDefinition,
  type ComponentDefinition,
} from "@/lib/page-builder/registry";
import type {
  PageDocument,
  PageNode,
  PageStyle,
} from "@/lib/page-builder/schema";

type Device = "desktop" | "tablet" | "mobile";
type BuilderPage = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  version: number;
  document: PageDocument;
};
type Persist = (input: {
  document: PageDocument;
  version: number;
  mode: "manual" | "auto";
}) => Promise<{ version: number } | void> | { version: number } | void;

const previewSimulationCss = `
  [data-device="mobile"] [data-page-component] { overflow-wrap: anywhere; }
  [data-device="mobile"] [data-page-component] .grid { grid-template-columns: minmax(0, 1fr) !important; }
  [data-device="mobile"] [data-page-component] h1 { font-size: 2.5rem !important; line-height: 1.05 !important; }
  [data-device="mobile"] [data-page-component] h2 { font-size: 2.25rem !important; line-height: 1.08 !important; }
  [data-device="mobile"] [data-page-component] h3 { font-size: 1.5rem !important; line-height: 1.15 !important; }
  [data-device="tablet"] [data-page-component] h1,
  [data-device="tablet"] [data-page-component] h2 { font-size: 3rem !important; line-height: 1.08 !important; }
`;

function clone<T>(value: T): T {
  return structuredClone(value);
}
function createId(type: string) {
  return `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function LayerRow({
  node,
  index,
  selected,
  onSelect,
  onMove,
  onUp,
  onDown,
}: {
  node: PageNode;
  index: number;
  selected: boolean;
  onSelect(): void;
  onMove(from: number, to: number): void;
  onUp(): void;
  onDown(): void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const definition = getComponentDefinition(node.type);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const cleanupDrag = draggable({
      element,
      getInitialData: () => ({ index }),
    });
    const cleanupDrop = dropTargetForElements({
      element,
      getData: () => ({ index }),
      onDrop: ({ source }) => {
        const from = source.data.index;
        if (typeof from === "number") onMove(from, index);
      },
    });
    return () => {
      cleanupDrag();
      cleanupDrop();
    };
  }, [index, onMove]);
  const label = definition?.label ?? node.type;
  return (
    <li
      ref={ref}
      data-testid="page-layer"
      className={`group flex items-center gap-1 rounded-lg border px-2 py-2 ${selected ? "border-[#76B900] bg-lime-50" : "border-transparent hover:border-neutral-200 hover:bg-neutral-50"}`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`选择 ${label}`}
        className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"
      >
        <span className="cursor-grab text-neutral-400">⋮⋮</span>
        <span className="truncate font-medium">{label}</span>
      </button>
      <button
        type="button"
        onClick={onUp}
        aria-label={`上移 ${label}`}
        className="rounded p-1 text-neutral-500 hover:bg-white"
      >
        <ArrowUp size={15} />
      </button>
      <button
        type="button"
        onClick={onDown}
        aria-label={`下移 ${label}`}
        className="rounded p-1 text-neutral-500 hover:bg-white"
      >
        <ArrowDown size={15} />
      </button>
    </li>
  );
}

function FieldEditor({
  definition,
  node,
  onChange,
}: {
  definition: ComponentDefinition;
  node: PageNode;
  onChange(content: Record<string, unknown>): void;
}) {
  const content = node.content as Record<string, unknown>;
  return (
    <div className="space-y-4">
      {definition.editorFields.map((field) => {
        const value = content[field.key];
        if (field.kind === "json" || field.kind === "list")
          return (
            <label key={field.key} className="block">
              <span className="text-xs font-semibold text-neutral-600">
                {field.label}
              </span>
              <textarea
                aria-label={field.label}
                defaultValue={
                  field.kind === "list" &&
                  Array.isArray(value) &&
                  value.every((item) => typeof item === "string")
                    ? value.join("\n")
                    : JSON.stringify(value, null, 2)
                }
                onBlur={(event) => {
                  try {
                    const next =
                      field.kind === "list"
                        ? event.target.value.split("\n").filter(Boolean)
                        : JSON.parse(event.target.value);
                    onChange({ ...content, [field.key]: next });
                  } catch {
                    /* keep last valid content */
                  }
                }}
                rows={5}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-xs"
              />
            </label>
          );
        return (
          <label key={field.key} className="block">
            <span className="text-xs font-semibold text-neutral-600">
              {field.label}
            </span>
            {field.kind === "textarea" ? (
              <textarea
                aria-label={field.label}
                value={String(value ?? "")}
                onChange={(event) =>
                  onChange({ ...content, [field.key]: event.target.value })
                }
                rows={4}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            ) : (
              <input
                aria-label={field.label}
                type={field.kind === "number" ? "number" : "text"}
                value={String(value ?? "")}
                onChange={(event) =>
                  onChange({
                    ...content,
                    [field.key]:
                      field.kind === "number"
                        ? Number(event.target.value)
                        : event.target.value,
                  })
                }
                className="mt-1 h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm"
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

export function PageBuilder({
  page,
  canPublish,
  onPersist,
}: {
  page: BuilderPage;
  canPublish: boolean;
  onPersist?: Persist;
}) {
  const [document, setDocument] = useState(() => clone(page.document));
  const [templateChoice, setTemplateChoice] = useState("home");
  const [past, setPast] = useState<PageDocument[]>([]);
  const [future, setFuture] = useState<PageDocument[]>([]);
  const [selectedId, setSelectedId] = useState(
    page.document.nodes[0]?.id ?? "",
  );
  const [device, setDevice] = useState<Device>("desktop");
  const [version, setVersion] = useState(page.version);
  const [status, setStatus] = useState(page.status);
  const [message, setMessage] = useState("所有更改已保存");
  const [dirty, setDirty] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<
    Array<{
      version: number;
      action: string;
      createdAt: string;
      createdBy: { name: string };
    }>
  >([]);
  const versionRef = useRef(page.version);
  const editRevisionRef = useRef(0);
  const savedRevisionRef = useRef(0);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const operationEpochRef = useRef(0);

  const selectedIndex = document.nodes.findIndex(
    (node) => node.id === selectedId,
  );
  const selected = document.nodes[selectedIndex];
  const selectedDefinition = selected
    ? getComponentDefinition(selected.type)
    : undefined;

  const commit = useCallback(
    (next: PageDocument, nextSelectedId?: string) => {
      editRevisionRef.current += 1;
      setPast((items) => [...items.slice(-49), document]);
      setDocument(next);
      setFuture([]);
      setDirty(true);
      setStatus("DRAFT");
      setMessage("有未保存更改");
      if (nextSelectedId !== undefined) setSelectedId(nextSelectedId);
    },
    [document],
  );
  const move = useCallback(
    (from: number, to: number) => {
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= document.nodes.length ||
        to >= document.nodes.length
      )
        return;
      const nodes = [...document.nodes];
      const [item] = nodes.splice(from, 1);
      nodes.splice(to, 0, item);
      commit({ ...document, nodes });
    },
    [commit, document],
  );

  const persist = useCallback(
    (mode: "manual" | "auto") => {
      const requestedRevision = editRevisionRef.current;
      const requestedDocument = clone(document);
      const requestedEpoch = operationEpochRef.current;
      setMessage(mode === "auto" ? "正在自动保存…" : "正在保存…");
      const task = saveQueueRef.current.then(async () => {
        if (requestedEpoch !== operationEpochRef.current) return undefined;
        if (savedRevisionRef.current >= requestedRevision) {
          setMessage(mode === "auto" ? "已自动保存" : "草稿已保存");
          return versionRef.current;
        }
        try {
          const requestVersion = versionRef.current;
          const result = onPersist
            ? await onPersist({
                document: requestedDocument,
                version: requestVersion,
                mode,
              })
            : await fetch(`/api/admin/pages/${page.id}`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  version: requestVersion,
                  document: requestedDocument,
                }),
              }).then(async (response) => {
                const body = await response.json();
                if (!response.ok) throw new Error(body.message ?? "保存失败");
                return body as { version: number };
              });
          const savedVersion = result?.version ?? requestVersion;
          if (result?.version) {
            versionRef.current = result.version;
          }
          if (requestedEpoch !== operationEpochRef.current) return savedVersion;
          if (result?.version) {
            setVersion(result.version);
          }
          savedRevisionRef.current = Math.max(
            savedRevisionRef.current,
            requestedRevision,
          );
          const hasNewerChanges =
            editRevisionRef.current > savedRevisionRef.current;
          setDirty(hasNewerChanges);
          setMessage(
            hasNewerChanges
              ? "有未保存更改"
              : mode === "auto"
                ? "已自动保存"
                : "草稿已保存",
          );
          return savedVersion;
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "保存失败");
          return undefined;
        }
      });
      saveQueueRef.current = task.then(
        () => undefined,
        () => undefined,
      );
      return task;
    },
    [document, onPersist, page.id],
  );

  useEffect(() => {
    if (!dirty || onPersist) return;
    const timer = window.setTimeout(() => void persist("auto"), 2_000);
    return () => window.clearTimeout(timer);
  }, [dirty, onPersist, persist]);

  function add(definition: ComponentDefinition) {
    const node = {
      id: createId(definition.type),
      type: definition.type,
      content: clone(definition.defaultContent),
    } as PageNode;
    commit({ ...document, nodes: [...document.nodes, node] }, node.id);
  }
  function duplicate() {
    if (!selected) return;
    const copy = { ...clone(selected), id: createId(selected.type) };
    const nodes = [...document.nodes];
    nodes.splice(selectedIndex + 1, 0, copy);
    commit({ ...document, nodes }, copy.id);
  }
  function remove() {
    if (!selected) return;
    const nodes = document.nodes.filter((node) => node.id !== selected.id);
    commit(
      { ...document, nodes },
      nodes[Math.min(selectedIndex, nodes.length - 1)]?.id ?? "",
    );
  }
  function undo() {
    const previous = past.at(-1);
    if (!previous) return;
    editRevisionRef.current += 1;
    setFuture((items) => [document, ...items]);
    setDocument(previous);
    setPast((items) => items.slice(0, -1));
    setDirty(true);
    setSelectedId(previous.nodes[0]?.id ?? "");
  }
  function redo() {
    const next = future[0];
    if (!next) return;
    editRevisionRef.current += 1;
    setPast((items) => [...items, document]);
    setDocument(next);
    setFuture((items) => items.slice(1));
    setDirty(true);
    setSelectedId(next.nodes[0]?.id ?? "");
  }
  async function publish() {
    setMessage("正在发布…");
    try {
      const publishVersion = dirty ? await persist("manual") : version;
      if (!publishVersion) return;
      const response = await fetch(`/api/admin/pages/${page.id}/publish`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ version: publishVersion }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "发布失败");
      versionRef.current = body.version;
      setVersion(body.version);
      setStatus("PUBLISHED");
      setMessage("已发布到前台");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "发布失败");
    }
  }
  async function openHistory() {
    setHistoryOpen(true);
    const response = await fetch(`/api/admin/pages/${page.id}/versions`);
    if (response.ok) setVersions(await response.json());
  }
  async function rollback(targetVersion: number) {
    operationEpochRef.current += 1;
    setMessage("正在恢复历史版本…");
    await saveQueueRef.current;
    const response = await fetch(`/api/admin/pages/${page.id}/rollback`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ version: versionRef.current, targetVersion }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.message ?? "回滚失败");
      return;
    }
    setDocument(body.draftContent);
    editRevisionRef.current += 1;
    savedRevisionRef.current = editRevisionRef.current;
    versionRef.current = body.version;
    setVersion(body.version);
    setStatus("DRAFT");
    setDirty(false);
    setSelectedId(body.draftContent.nodes[0]?.id ?? "");
    setHistoryOpen(false);
    setMessage(`已恢复 v${targetVersion} 为新草稿`);
  }

  function applyTemplate() {
    const preset = INDUSTRIAL_PAGE_TEMPLATES[templateChoice];
    if (!preset) return;
    if (!window.confirm("替换当前草稿全部模块？建议先保存当前版本，发布后仍可从历史版本恢复。")) return;
    const next = clone(preset.document);
    commit(next, next.nodes[0]?.id ?? "");
    setMessage(`已应用「${preset.label}」，请按实际产品资料编辑后保存。`);
  }

  const groups = useMemo(
    () =>
      ["基础", "布局", "外贸业务", "营销"].map((group) => ({
        group,
        definitions: componentRegistry.filter((item) => item.group === group),
      })),
    [],
  );
  const canvasWidth =
    device === "desktop" ? "100%" : device === "tablet" ? "768px" : "390px";
  const previewDocument = useMemo<PageDocument>(
    () => ({
      ...document,
      nodes: document.nodes.map((node) => ({
        ...node,
        style:
          device === "desktop"
            ? node.style
            : { ...node.style, ...node.responsive?.[device] },
      })),
    }),
    [device, document],
  );
  const activeStyle = selected
    ? device === "desktop"
      ? (selected.style ?? {})
      : (selected.responsive?.[device] ?? {})
    : {};
  function updateStyle(changes: Partial<PageStyle>) {
    if (!selected) return;
    const nodes = [...document.nodes];
    nodes[selectedIndex] =
      device === "desktop"
        ? { ...selected, style: { ...selected.style, ...changes } }
        : {
            ...selected,
            responsive: {
              ...selected.responsive,
              [device]: { ...selected.responsive?.[device], ...changes },
            },
          };
    commit({ ...document, nodes });
  }

  return (
    <div className="-m-4 min-h-[calc(100vh-4rem)] bg-[#ECEFF1] sm:-m-6 lg:-m-8">
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white px-4 py-2">
        <label htmlFor="industrial-template-select" className="text-xs font-semibold text-neutral-600">页面模板</label>
        <select id="industrial-template-select" value={templateChoice} onChange={(event) => setTemplateChoice(event.target.value)} className="h-9 rounded border border-neutral-300 px-2 text-sm">
          {Object.entries(INDUSTRIAL_PAGE_TEMPLATES).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}
        </select>
        <button type="button" onClick={applyTemplate} className="rounded border border-neutral-300 px-3 py-2 text-xs font-semibold hover:border-[#76B900]">应用模板到草稿</button>
        <span className="text-xs text-neutral-500">模块可继续增加、排序、复制、删除；应用模板不会自动发布。</span>
      </div>
      <header className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold">{page.name}</h1>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status === "PUBLISHED" ? "bg-lime-100 text-lime-800" : "bg-amber-100 text-amber-800"}`}
            >
              {status === "PUBLISHED" ? "已发布" : "草稿"}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            /{page.slug === "home" ? "" : page.slug} · v{version} · {message}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            aria-label="撤销"
            disabled={!past.length}
            onClick={undo}
            className="rounded-lg p-2 hover:bg-neutral-100 disabled:opacity-30"
          >
            <Undo2 size={18} />
          </button>
          <button
            type="button"
            aria-label="重做"
            disabled={!future.length}
            onClick={redo}
            className="rounded-lg p-2 hover:bg-neutral-100 disabled:opacity-30"
          >
            <Redo2 size={18} />
          </button>
          <div className="mx-1 h-6 w-px bg-neutral-200" />
          {(["desktop", "tablet", "mobile"] as Device[]).map((item) => {
            const Icon =
              item === "desktop"
                ? Monitor
                : item === "tablet"
                  ? Laptop
                  : Smartphone;
            const label =
              item === "desktop"
                ? "桌面预览"
                : item === "tablet"
                  ? "平板预览"
                  : "手机预览";
            return (
              <button
                key={item}
                type="button"
                aria-label={label}
                onClick={() => setDevice(item)}
                className={`rounded-lg p-2 ${device === item ? "bg-[#0B0D10] text-white" : "hover:bg-neutral-100"}`}
              >
                <Icon size={18} />
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              void (async () => {
                if (dirty) await persist("manual");
                window.open(`/admin/pages/${page.id}/preview`, "_blank", "noopener,noreferrer");
              })();
            }}
            className="ml-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold"
          >
            独立预览
          </button>
          <button
            type="button"
            onClick={() => void openHistory()}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold"
          >
            <History size={16} />
            历史
          </button>
          <button
            type="button"
            onClick={() => void persist("manual")}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold"
          >
            <Save size={16} />
            保存草稿
          </button>
          {canPublish ? (
            <button
              type="button"
              onClick={() => void publish()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#76B900] px-4 py-2 text-sm font-semibold text-[#0B0D10]"
            >
              <Check size={16} />
              发布
            </button>
          ) : null}
        </div>
      </header>
      <div className="grid min-h-[calc(100vh-8rem)] xl:grid-cols-[290px_minmax(0,1fr)_320px]">
        <aside
          role="region"
          aria-label="组件库与页面结构"
          className="border-r border-neutral-200 bg-white p-4"
        >
          <div className="max-h-[45vh] overflow-y-auto border-b border-neutral-200 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              组件库
            </h2>
            {groups.map(({ group, definitions }) => (
              <div key={group} className="mt-4">
                <p className="text-xs font-semibold text-neutral-500">
                  {group}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {definitions.map((definition) => (
                    <button
                      key={definition.type}
                      type="button"
                      aria-label={`添加 ${definition.label}`}
                      onClick={() => add(definition)}
                      className="flex min-h-16 flex-col items-start justify-between rounded-lg border border-neutral-200 p-2 text-left text-xs hover:border-[#76B900] hover:bg-lime-50"
                    >
                      <Plus size={14} />
                      <span className="font-semibold">{definition.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              页面结构
            </h2>
            <ul aria-label="页面结构" className="mt-2 space-y-1">
              {document.nodes.map((node, index) => (
                <LayerRow
                  key={node.id}
                  node={node}
                  index={index}
                  selected={node.id === selectedId}
                  onSelect={() => setSelectedId(node.id)}
                  onMove={move}
                  onUp={() => move(index, Math.max(0, index - 1))}
                  onDown={() =>
                    move(index, Math.min(document.nodes.length - 1, index + 1))
                  }
                />
              ))}
            </ul>
          </div>
        </aside>
        <section aria-label="页面画布" className="overflow-auto p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between text-xs text-neutral-500">
            <span>
              {device === "desktop"
                ? "Desktop · 自适应"
                : device === "tablet"
                  ? "Tablet · 768px"
                  : "Mobile · 390px"}
            </span>
            <span>真实响应式画布</span>
          </div>
          <div
            data-testid="page-canvas"
            data-device={device}
            className="mx-auto min-h-[720px] overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-[width] duration-300"
            style={{ width: canvasWidth, maxWidth: "100%" }}
          >
            <style>{previewSimulationCss}</style>
            <PageRenderer document={previewDocument} />
          </div>
        </section>
        <aside
          role="region"
          aria-label="组件属性"
          className="border-l border-neutral-200 bg-white p-4"
        >
          {selected && selectedDefinition ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-neutral-500">当前组件</p>
                  <h2 className="mt-1 font-semibold">
                    {selectedDefinition.label}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    {selectedDefinition.description}
                  </p>
                </div>
                <ChevronRight size={18} className="text-neutral-400" />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  aria-label="复制当前组件"
                  onClick={duplicate}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                >
                  <Copy size={14} />
                  复制
                </button>
                <button
                  type="button"
                  aria-label="删除当前组件"
                  onClick={remove}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
                >
                  <Trash2 size={14} />
                  删除
                </button>
              </div>
              <div className="mt-6 border-t pt-5">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  内容
                </h3>
                <FieldEditor
                  definition={selectedDefinition}
                  node={selected}
                  onChange={(content) => {
                    const nodes = [...document.nodes];
                    nodes[selectedIndex] = { ...selected, content } as PageNode;
                    commit({ ...document, nodes });
                  }}
                />
              </div>
              <div className="mt-6 border-t pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    样式
                  </h3>
                  <span className="text-xs text-neutral-400">{device}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="text-xs">
                    上下内边距
                    <input
                      type="number"
                      value={activeStyle.paddingY ?? ""}
                      onChange={(event) =>
                        updateStyle({
                          paddingY: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        })
                      }
                      className="mt-1 h-9 w-full rounded border px-2"
                    />
                  </label>
                  <label className="text-xs">
                    列数
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={activeStyle.columns ?? ""}
                      onChange={(event) =>
                        updateStyle({
                          columns: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        })
                      }
                      className="mt-1 h-9 w-full rounded border px-2"
                    />
                  </label>
                  <label className="col-span-2 text-xs">
                    背景颜色
                    <input
                      type="text"
                      value={activeStyle.backgroundColor ?? ""}
                      placeholder="#0B0D10"
                      onChange={(event) =>
                        updateStyle({
                          backgroundColor: event.target.value || undefined,
                        })
                      }
                      className="mt-1 h-9 w-full rounded border px-2"
                    />
                  </label>
                  <label className="text-xs">
                    字号
                    <input
                      type="number"
                      value={activeStyle.fontSize ?? ""}
                      onChange={(event) =>
                        updateStyle({
                          fontSize: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        })
                      }
                      className="mt-1 h-9 w-full rounded border px-2"
                    />
                  </label>
                  <label className="col-span-2 text-xs">
                    文字颜色
                    <div className="mt-1 flex gap-2">
                      <input type="color" aria-label="选择文字颜色" value={activeStyle.textColor ?? "#1D1D1F"} onChange={(event) => updateStyle({ textColor: event.target.value })} className="h-9 w-12 cursor-pointer rounded border" />
                      <input type="text" value={activeStyle.textColor ?? ""} placeholder="#1D1D1F" onChange={(event) => updateStyle({ textColor: event.target.value || undefined })} className="h-9 min-w-0 flex-1 rounded border px-2" />
                    </div>
                  </label>
                  <label className="col-span-2 text-xs">
                    字体
                    <select value={activeStyle.fontFamily ?? "sans"} onChange={(event) => updateStyle({ fontFamily: event.target.value as PageStyle["fontFamily"] })} className="mt-1 h-9 w-full rounded border px-2">
                      <option value="sans">无衬线 Sans</option><option value="serif">衬线 Serif</option><option value="mono">等宽 Mono</option>
                    </select>
                  </label>
                  <label className="text-xs">
                    字重
                    <select value={activeStyle.fontWeight ?? "normal"} onChange={(event) => updateStyle({ fontWeight: event.target.value as PageStyle["fontWeight"] })} className="mt-1 h-9 w-full rounded border px-2">
                      <option value="normal">常规</option><option value="medium">中等</option><option value="semibold">半粗</option><option value="bold">粗体</option>
                    </select>
                  </label>
                  <label className="text-xs">
                    文字对齐
                    <select value={activeStyle.textAlign ?? "left"} onChange={(event) => updateStyle({ textAlign: event.target.value as PageStyle["textAlign"] })} className="mt-1 h-9 w-full rounded border px-2">
                      <option value="left">左对齐</option><option value="center">居中</option><option value="right">右对齐</option>
                    </select>
                  </label>
                  <label className="text-xs">
                    行高
                    <input type="number" min="1" max="2" step="0.1" value={activeStyle.lineHeight ?? ""} onChange={(event) => updateStyle({ lineHeight: event.target.value ? Number(event.target.value) : undefined })} className="mt-1 h-9 w-full rounded border px-2" />
                  </label>
                  <label className="text-xs">
                    字间距
                    <input type="number" min="-2" max="8" step="0.1" value={activeStyle.letterSpacing ?? ""} onChange={(event) => updateStyle({ letterSpacing: event.target.value ? Number(event.target.value) : undefined })} className="mt-1 h-9 w-full rounded border px-2" />
                  </label>
                  <label className="flex items-end gap-2 pb-2 text-xs">
                    <input
                      type="checkbox"
                      checked={activeStyle.visible !== false}
                      onChange={(event) =>
                        updateStyle({ visible: event.target.checked })
                      }
                    />
                    当前设备显示
                  </label>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-sm text-neutral-500">
              从组件库添加并选择一个组件。
            </div>
          )}
        </aside>
      </div>
      {historyOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="版本历史"
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
        >
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">版本历史</h2>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="rounded-lg border px-3 py-1.5 text-sm"
              >
                关闭
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {versions.map((item) => (
                <article key={item.version} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        v{item.version} · {formatAdminEnum(item.action)}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {item.createdBy.name} ·{" "}
                        {new Date(item.createdAt).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void rollback(item.version)}
                      className="rounded-lg border px-3 py-2 text-xs font-semibold"
                    >
                      恢复为草稿
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
