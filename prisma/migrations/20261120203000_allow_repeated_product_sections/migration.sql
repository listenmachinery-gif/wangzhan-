-- Product pages may intentionally repeat the same section type (for example,
-- multiple feature, gallery, application, or CTA sections). Position remains
-- unique per product, so existing ordering and data are preserved.
DROP INDEX IF EXISTS "ProductSection_productId_type_key";

CREATE INDEX IF NOT EXISTS "ProductSection_productId_type_idx"
  ON "ProductSection"("productId", "type");
