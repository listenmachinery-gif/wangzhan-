export const SMALL_ELECTRIC_SHEAR_MATERIALS = [
  "Mild Steel Sheet",
  "Aluminum Sheet",
  "Galvanized Steel Sheet",
  "Stainless Steel Sheet",
  "Copper Sheet",
  "Printed Circuit Board",
  "Stainless Steel Security Mesh",
  "Prepainted Steel Sheet",
  "Glass-Epoxy Laminate Sheet",
] as const;

export const SMALL_ELECTRIC_SHEAR_BACKGAUGES = [
  "Manually Adjustable Backgauge",
  "Handwheel-Adjustable Backgauge",
  "Motorized Backgauge",
] as const;

export type SmallElectricShearMaterial = (typeof SMALL_ELECTRIC_SHEAR_MATERIALS)[number];

export type SmallElectricShearRecommendation = {
  model: string;
  maxThickness: number;
  maxWidth: number;
};

const MODEL_TIERS = [
  { model: "Q11G-2X600", maxWidth: 600 },
  { model: "Q11G-2X800", maxWidth: 800 },
  { model: "Q11G-2X1000", maxWidth: 1000 },
  { model: "Q11G-2X1300", maxWidth: 1300 },
  { model: "Q11G-2X1500", maxWidth: 1500 },
  { model: "Q11G-2X1600", maxWidth: 1600 },
  { model: "Q11G-1.5X2000", maxWidth: 2000 },
  { model: "Q11G-1.2X2500", maxWidth: 2500 },
] as const;

const standardThicknesses = [2, 2, 2, 2, 2, 2, 1.5, 1.2] as const;
const softMetalThicknesses = [3, 3, 3, 3, 3, 3, 2.5, 2] as const;
const stainlessThicknesses = [1, 1, 1, 1, 1, 1, 0.8, 0.6] as const;

const thicknessProfiles: Record<SmallElectricShearMaterial, readonly number[]> = {
  "Mild Steel Sheet": standardThicknesses,
  "Aluminum Sheet": softMetalThicknesses,
  "Galvanized Steel Sheet": standardThicknesses,
  "Stainless Steel Sheet": stainlessThicknesses,
  "Copper Sheet": softMetalThicknesses,
  "Printed Circuit Board": standardThicknesses,
  "Stainless Steel Security Mesh": standardThicknesses,
  "Prepainted Steel Sheet": standardThicknesses,
  "Glass-Epoxy Laminate Sheet": standardThicknesses,
};

const materialSet = new Set<string>(SMALL_ELECTRIC_SHEAR_MATERIALS);

export function recommendSmallElectricShear(
  material: string,
  thickness: number,
  width: number,
): SmallElectricShearRecommendation | null {
  if (
    !materialSet.has(material) ||
    !Number.isFinite(thickness) ||
    !Number.isFinite(width) ||
    thickness <= 0 ||
    width <= 0
  ) {
    return null;
  }

  const maxThicknesses = thicknessProfiles[material as SmallElectricShearMaterial];

  for (let index = 0; index < MODEL_TIERS.length; index += 1) {
    const tier = MODEL_TIERS[index];
    const maxThickness = maxThicknesses[index];

    if (width <= tier.maxWidth && thickness <= maxThickness) {
      return {
        model: tier.model,
        maxThickness,
        maxWidth: tier.maxWidth,
      };
    }
  }

  return null;
}
