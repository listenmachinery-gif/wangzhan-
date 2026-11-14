CREATE OR REPLACE FUNCTION prevent_locked_product_slug_change()
RETURNS trigger AS $$
BEGIN
  IF OLD."slugLocked" AND (
    NEW.slug IS DISTINCT FROM OLD.slug
    OR NEW."slugLocked" IS DISTINCT FROM TRUE
  ) THEN
    RAISE EXCEPTION 'Cannot change or unlock a locked product slug'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
