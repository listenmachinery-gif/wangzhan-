DROP TRIGGER IF EXISTS product_slug_lock_guard ON "Product";

CREATE TRIGGER product_slug_lock_guard
BEFORE UPDATE OF "slug", "slugLocked" ON "Product"
FOR EACH ROW
EXECUTE FUNCTION prevent_locked_product_slug_change();
