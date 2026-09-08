/**
 * Fallback filter option lists for the Buy Property search, kept in step with
 * the app's buy_property_screen.dart. They are shown until GET /filter-options
 * (admin managed) resolves, and if that request fails. Group keys match the
 * backend's FILTER_OPTION_GROUPS.
 */

export const FALLBACK_PROPERTY_TYPES = [
  "Open Plots",
  "Residential House",
  "Apartments",
  "Villas",
  "Farm House",
  "Agriculture Lands",
  "Farmlands",
];

export const FALLBACK_FACINGS = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

export const FALLBACK_BHK_OPTIONS = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "5+ BHK",
];

export const FALLBACK_PLOT_SIZES_DEFAULT = [
  "0-100",
  "100-200",
  "200-300",
  "300-500",
  "500-1000",
  "1000+",
];
export const FALLBACK_PLOT_SIZES_AGRI = [
  "1 Gunta",
  "2-5 Guntas",
  "5-10 Guntas",
  "1 Acre",
  "2-5 Acres",
  "5+ Acres",
];
export const FALLBACK_PLOT_SIZES_FARM = [
  "1-3 Guntas",
  "3-5 Guntas",
  "5-10 Guntas",
  "1 Acre",
  "2+ Acres",
];
export const FALLBACK_PLOT_SIZES_RESIDENTIAL = [
  "100-200 Sq.Yds",
  "200-300 Sq.Yds",
  "300-500 Sq.Yds",
  "500+ Sq.Yds",
  "800-1200 Sft",
  "1200-2000 Sft",
  "2000+ Sft",
];
export const FALLBACK_PLOT_SIZES_APARTMENTS = [
  "500-1000 Sft",
  "1000-1500 Sft",
  "1500-2000 Sft",
  "2000-3000 Sft",
  "3000+ Sft",
];
export const FALLBACK_PLOT_SIZES_VILLAS = [
  "100-200 Sq.Yds",
  "200-500 Sq.Yds",
  "1000-2000 Sft",
  "2000-3000 Sft",
  "3000+ Sft",
];

export const FALLBACK_PRICE_RANGES = [
  "Under ₹25 Lakh",
  "₹25-50 Lakh",
  "₹50 Lakh - 1 Cr",
  "₹1-2 Cr",
  "₹2-5 Cr",
  "Above ₹5 Cr",
];

export interface PriceBounds {
  minPrice: number | null;
  maxPrice: number | null;
}

export const FALLBACK_PRICE_RANGE_BOUNDS: Record<string, PriceBounds> = {
  "Under ₹25 Lakh": { minPrice: null, maxPrice: 2500000 },
  "₹25-50 Lakh": { minPrice: 2500000, maxPrice: 5000000 },
  "₹50 Lakh - 1 Cr": { minPrice: 5000000, maxPrice: 10000000 },
  "₹1-2 Cr": { minPrice: 10000000, maxPrice: 20000000 },
  "₹2-5 Cr": { minPrice: 20000000, maxPrice: 50000000 },
  "Above ₹5 Cr": { minPrice: 50000000, maxPrice: null },
};

/** Plot size list depends on the selected property type, as in the app. */
export function plotSizesForType(
  type: string,
  lists: {
    default: string[];
    agri: string[];
    farm: string[];
    residential: string[];
    apartments: string[];
    villas: string[];
  },
): string[] {
  if (type === "Agriculture Lands") return lists.agri;
  if (type === "Farmlands" || type === "Farm House") return lists.farm;
  if (type === "Residential House") return lists.residential;
  if (type === "Apartments") return lists.apartments;
  if (type === "Villas") return lists.villas;
  return lists.default;
}
