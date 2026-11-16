"use client";

import { useId, useRef } from "react";

import { inquiryLegacyStatusLabels } from "@/components/admin/crm/inquiry-options";
import { InquirySelectFilter } from "@/components/admin/crm/InquirySelectFilter";
import { DEFAULT_CRM_STAGES, stageToLegacyStatus } from "@/lib/crm/stages";

const statusOptions = Object.entries(inquiryLegacyStatusLabels).map(([value, label]) => ({ value, label }));

function incompatible(stageCode: string, status: string) {
  if (!stageCode || !status) return false;
  const stage = DEFAULT_CRM_STAGES.find((code) => code === stageCode);
  return !stage || stageToLegacyStatus(stage) !== status;
}

export function InquiryStageFilters({ stages, stageCode, status }: {
  stages: { code: string; name: string }[];
  stageCode?: string;
  status?: string;
}) {
  const stageSelect = useRef<HTMLSelectElement>(null);
  const statusSelect = useRef<HTMLSelectElement>(null);
  const hintId = useId();

  return (
    <>
      <span id={hintId} className="sr-only">销售阶段与旧版状态冲突时，以最近一次选择为准。</span>
      <InquirySelectFilter
        name="stageCode"
        label="销售阶段"
        placeholder="全部阶段"
        value={stageCode}
        options={stages.map(({ code, name }) => ({ value: code, label: name }))}
        ref={stageSelect}
        aria-describedby={hintId}
        onChange={(event) => {
          const other = statusSelect.current;
          if (other && incompatible(event.currentTarget.value, other.value)) other.value = "";
        }}
      />
      <InquirySelectFilter
        name="status"
        label="旧版状态"
        placeholder="全部状态"
        value={status}
        options={statusOptions}
        ref={statusSelect}
        aria-describedby={hintId}
        onChange={(event) => {
          const other = stageSelect.current;
          if (other && incompatible(other.value, event.currentTarget.value)) other.value = "";
        }}
      />
    </>
  );
}
