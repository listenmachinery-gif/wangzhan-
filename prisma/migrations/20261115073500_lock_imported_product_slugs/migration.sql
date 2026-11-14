CREATE OR REPLACE FUNCTION prevent_locked_product_slug_change()
RETURNS trigger AS $$
BEGIN
  IF OLD."slugLocked" AND NEW."slug" IS DISTINCT FROM OLD."slug" THEN
    RAISE EXCEPTION 'locked product slug cannot be changed' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_slug_lock_guard ON "Product";
CREATE TRIGGER product_slug_lock_guard
BEFORE UPDATE OF "slug" ON "Product"
FOR EACH ROW
EXECUTE FUNCTION prevent_locked_product_slug_change();
