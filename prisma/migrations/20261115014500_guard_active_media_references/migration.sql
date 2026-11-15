CREATE OR REPLACE FUNCTION "assert_media_asset_active"(media_id TEXT)
RETURNS VOID AS $$
DECLARE
  current_status TEXT;
BEGIN
  IF media_id IS NULL THEN
    RETURN;
  END IF;

  SELECT "lifecycleStatus"::TEXT
  INTO current_status
  FROM "MediaAsset"
  WHERE "id" = media_id
  FOR UPDATE;

  IF current_status IS DISTINCT FROM 'ACTIVE' THEN
    RAISE EXCEPTION 'media asset % is not active', media_id USING ERRCODE = '23514';
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "guard_media_reference_active"()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM "assert_media_asset_active"(NEW."mediaAssetId");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "guard_banner_media_active"()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM "assert_media_asset_active"(NEW."desktopMediaId");
  PERFORM "assert_media_asset_active"(NEW."tabletMediaId");
  PERFORM "assert_media_asset_active"(NEW."mobileMediaId");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "guard_seo_media_active"()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM "assert_media_asset_active"(NEW."openGraphMediaId");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "guard_referenced_media_transition"()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD."lifecycleStatus" = 'ACTIVE' AND NEW."lifecycleStatus" <> 'ACTIVE' AND (
    EXISTS (SELECT 1 FROM "MediaReference" WHERE "mediaAssetId" = OLD."id") OR
    EXISTS (SELECT 1 FROM "Banner" WHERE "desktopMediaId" = OLD."id" OR "tabletMediaId" = OLD."id" OR "mobileMediaId" = OLD."id") OR
    EXISTS (SELECT 1 FROM "SeoRecord" WHERE "openGraphMediaId" = OLD."id")
  ) THEN
    RAISE EXCEPTION 'referenced media asset % cannot leave active state', OLD."id" USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "MediaReference_active_media_guard"
BEFORE INSERT OR UPDATE OF "mediaAssetId" ON "MediaReference"
FOR EACH ROW EXECUTE FUNCTION "guard_media_reference_active"();

CREATE TRIGGER "Banner_active_media_guard"
BEFORE INSERT OR UPDATE OF "desktopMediaId", "tabletMediaId", "mobileMediaId" ON "Banner"
FOR EACH ROW EXECUTE FUNCTION "guard_banner_media_active"();

CREATE TRIGGER "SeoRecord_active_media_guard"
BEFORE INSERT OR UPDATE OF "openGraphMediaId" ON "SeoRecord"
FOR EACH ROW EXECUTE FUNCTION "guard_seo_media_active"();

CREATE TRIGGER "MediaAsset_referenced_transition_guard"
BEFORE UPDATE OF "lifecycleStatus" ON "MediaAsset"
FOR EACH ROW EXECUTE FUNCTION "guard_referenced_media_transition"();
