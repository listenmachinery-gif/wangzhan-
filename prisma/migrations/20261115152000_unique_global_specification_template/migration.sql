-- Preserve templates created before Model/SKU/Active became system-owned columns.
-- The id suffix keeps the rename collision-free within each template.
UPDATE "SpecificationField"
SET "name" = "name" || ' (legacy ' || "id" || ')'
WHERE LOWER(BTRIM("name")) IN ('model', 'sku', 'active');

-- The former nullable composite unique constraint allowed duplicate global names.
-- Keep every template and deterministically rename only duplicates before indexing.
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (
    PARTITION BY LOWER(BTRIM("name"))
    ORDER BY "createdAt", "id"
  ) AS duplicate_number
  FROM "SpecificationTemplate"
  WHERE "categoryId" IS NULL
)
UPDATE "SpecificationTemplate" AS template
SET "name" = template."name" || ' (duplicate ' || template."id" || ')'
FROM ranked
WHERE template."id" = ranked."id"
  AND ranked.duplicate_number > 1;

CREATE UNIQUE INDEX "SpecificationTemplate_global_name_key"
ON "SpecificationTemplate" (LOWER(BTRIM("name")))
WHERE "categoryId" IS NULL;
