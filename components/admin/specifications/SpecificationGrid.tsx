"use client";

import { useMemo, useState } from "react";

import { ImportReport, type ImportIssue } from "./ImportReport";

type Field = { id: string; name: string; unit: string | null; valueType: string; position: number };
type Template = { id: string; name: string; fields: Field[] };
type Model = { id?: string; name: string; sku: string | null; active: boolean; position: number; values: Record<string, string> };

export function SpecificationGrid({
  productId,
  initialVersion,
  templates,
  initialTemplateId,
  initialModels,
}: {
  productId: string;
  initialVersion: number;
  templates: Template[];
  initialTemplateId: string;
  initialModels: Model[];
}) {
  const [version, setVersion] = useState(initialVersion);
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [models, setModels] = useState(initialModels);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ImportIssue[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const template = useMemo(() => templates.find(({ id }) => id === templateId) ?? templates[0], [templateId, templates]);

  function updateModel(index: number, patch: Partial<Model>) {
    setModels((current) => current.map((model, modelIndex) => modelIndex === index ? { ...model, ...patch } : model));
  }

  function updateValue(index: number, fieldId: string, value: string) {
    setModels((current) => current.map((model, modelIndex) => modelIndex === index ? { ...model, values: { ...model.values, [fieldId]: value } } : model));
  }

  function addModel() {
    if (!template) return;
    setModels((current) => [...current, {
      name: "",
      sku: null,
      active: true,
      position: current.length,
      values: Object.fromEntries(template.fields.map(({ id }) => [id, ""])),
    }]);
  }

  async function save() {
    setBusy(true); setMessage(""); setErrors([]);
    const response = await fetch(`/api/admin/products/${productId}/models`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ version, templateId: template?.id, models: models.map((model, position) => ({ ...model, position, sku: model.sku || null })) }),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(result.message ?? "保存失败。");
    setVersion(result.version);
    setMessage(`已保存 ${models.length} 个型号，当前版本 ${result.version}。`);
  }

  async function importFile() {
    if (!file || !template) return setMessage("请选择 CSV 或 XLSX 文件。");
    setBusy(true); setMessage(""); setErrors([]);
    const body = new FormData();
    body.append("version", String(version)); body.append("templateId", template.id); body.append("file", file);
    const response = await fetch(`/api/admin/products/${productId}/specifications/import`, { method: "POST", body });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      setErrors(result.errors ?? []);
      return setMessage(result.message ?? "导入校验未通过。");
    }
    setVersion(result.version);
    setMessage(`成功导入 ${result.importedRows} 行，公开参数表已同步。`);
    const grid = await fetch(`/api/admin/products/${productId}/models`).then((response) => response.json());
    const refreshed = grid.product.models.map((model: { id: string; name: string; sku: string | null; active: boolean; position: number; values: Array<{ fieldId: string; value: string }> }) => ({
      ...model,
      values: Object.fromEntries(model.values.map(({ fieldId, value }) => [fieldId, value])),
    }));
    setModels(refreshed);
  }

  if (!template) return <p className="rounded-xl border border-dashed p-8 text-center text-neutral-600">该产品分类尚无参数模板，请先在“型号参数”中创建模板。</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <label className="text-sm font-semibold">参数模板
          <select value={template.id} onChange={(event) => { setTemplateId(event.target.value); setModels([]); setErrors([]); setMessage("切换模板后请重新录入或导入型号。"); }} className="mt-2 block w-full max-w-xl rounded-lg border px-3 py-2">
            {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      </section>

      <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse text-sm">
            <thead className="bg-neutral-950 text-white"><tr><th className="px-3 py-3 text-left">型号</th><th className="px-3 py-3 text-left">SKU</th><th className="px-3 py-3 text-center">启用</th>{template.fields.map((field) => <th key={field.id} className="px-3 py-3 text-left">{field.name}{field.unit ? ` [${field.unit}]` : ""}</th>)}<th className="px-3 py-3">操作</th></tr></thead>
            <tbody>{models.map((model, index) => <tr key={model.id ?? `new-${index}`} className="border-t">
              <td className="p-2"><input aria-label={`型号名称 ${index + 1}`} value={model.name} onChange={(event) => updateModel(index, { name: event.target.value })} className="w-44 rounded border px-2 py-2" /></td>
              <td className="p-2"><input aria-label={`SKU ${index + 1}`} value={model.sku ?? ""} onChange={(event) => updateModel(index, { sku: event.target.value || null })} className="w-40 rounded border px-2 py-2" /></td>
              <td className="p-2 text-center"><input aria-label={`启用型号 ${index + 1}`} type="checkbox" checked={model.active} onChange={(event) => updateModel(index, { active: event.target.checked })} /></td>
              {template.fields.map((field) => <td key={field.id} className="p-2"><input aria-label={`${field.name} ${index + 1}`} inputMode={field.valueType === "NUMBER" ? "decimal" : undefined} value={model.values[field.id] ?? ""} onChange={(event) => updateValue(index, field.id, event.target.value)} className="w-40 rounded border px-2 py-2" /></td>)}
              <td className="p-2 text-center"><button type="button" onClick={() => setModels((current) => current.filter((_, modelIndex) => modelIndex !== index))} className="rounded border border-red-200 px-3 py-2 text-red-700">删除</button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-3 border-t p-4"><button type="button" onClick={addModel} className="rounded-lg border px-4 py-2 font-semibold">新增型号</button><button type="button" disabled={busy || models.length === 0} onClick={() => void save()} className="rounded-lg bg-[#0B0D10] px-5 py-2 font-semibold text-white disabled:opacity-50">保存型号参数</button></div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">批量导入与安全导出</h2>
        <p className="mt-1 text-sm text-neutral-600">支持 CSV/XLSX，最多 1,000 行、10 MB。只有整份文件校验通过后才会写入数据库。</p>
        <div className="mt-4 flex flex-wrap items-center gap-3"><input aria-label="导入参数文件" type="file" accept=".csv,.xlsx" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /><button type="button" disabled={busy || !file} onClick={() => void importFile()} className="rounded-lg bg-[#76B900] px-4 py-2 font-semibold disabled:opacity-50">导入并校验</button><a className="rounded-lg border px-4 py-2 font-semibold" href={`/api/admin/products/${productId}/specifications/export?templateId=${encodeURIComponent(template.id)}&format=csv`}>导出 CSV</a><a className="rounded-lg border px-4 py-2 font-semibold" href={`/api/admin/products/${productId}/specifications/export?templateId=${encodeURIComponent(template.id)}&format=xlsx`}>导出 XLSX</a></div>
      </section>
      <ImportReport errors={errors} />
      {message ? <p role="status" className="text-sm text-neutral-700">{message}</p> : null}
    </div>
  );
}
