import { productModuleSchemas } from "@/lib/product-modules/schemas";
import {
  SMALL_ELECTRIC_PRODUCT_MODULE_LABELS,
  SMALL_ELECTRIC_PRODUCT_MODULE_ORDER,
} from "@/lib/product-modules/small-electric-template";
import type { ProductModuleType } from "@/lib/product-modules/types";

export const productModuleRegistry = Object.fromEntries(
  SMALL_ELECTRIC_PRODUCT_MODULE_ORDER.map((type, position) => [
    type,
    { type, position, label: SMALL_ELECTRIC_PRODUCT_MODULE_LABELS[type], schema: productModuleSchemas[type] },
  ]),
) as Record<ProductModuleType, {
  type: ProductModuleType;
  position: number;
  label: string;
  schema: (typeof productModuleSchemas)[ProductModuleType];
}>;
