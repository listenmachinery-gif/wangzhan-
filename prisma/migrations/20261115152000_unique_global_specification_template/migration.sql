CREATE UNIQUE INDEX "SpecificationTemplate_global_name_key"
ON "SpecificationTemplate" ("name")
WHERE "categoryId" IS NULL;
