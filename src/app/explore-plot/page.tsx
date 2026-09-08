"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, SlidersHorizontal, X } from "lucide-react";
import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PropertyResultCard from "@/components/PropertyResultCard";
import { contentApi, propertiesApi, Property, FaqItem } from "@/lib/api";
import {
  FALLBACK_BHK_OPTIONS,
  FALLBACK_FACINGS,
  FALLBACK_PLOT_SIZES_AGRI,
  FALLBACK_PLOT_SIZES_APARTMENTS,
  FALLBACK_PLOT_SIZES_DEFAULT,
  FALLBACK_PLOT_SIZES_FARM,
  FALLBACK_PLOT_SIZES_RESIDENTIAL,
  FALLBACK_PLOT_SIZES_VILLAS,
  FALLBACK_PRICE_RANGES,
  FALLBACK_PRICE_RANGE_BOUNDS,
  FALLBACK_PROPERTY_TYPES,
  PriceBounds,
  plotSizesForType,
} from "@/lib/buyFilters";

export default function BuyPropertyPage() {
  // Filter option lists, replaced in place once GET /filter-options resolves.
  const [propertyTypes, setPropertyTypes] = useState(FALLBACK_PROPERTY_TYPES);
  const [facings, setFacings] = useState(FALLBACK_FACINGS);
  const [bhkOptions, setBhkOptions] = useState(FALLBACK_BHK_OPTIONS);
  const [priceRanges, setPriceRanges] = useState(FALLBACK_PRICE_RANGES);
  const [priceBounds, setPriceBounds] = useState<Record<string, PriceBounds>>(
    FALLBACK_PRICE_RANGE_BOUNDS,
  );
  const [plotSizeLists, setPlotSizeLists] = useState({
    default: FALLBACK_PLOT_SIZES_DEFAULT,
    agri: FALLBACK_PLOT_SIZES_AGRI,
    farm: FALLBACK_PLOT_SIZES_FARM,
    residential: FALLBACK_PLOT_SIZES_RESIDENTIAL,
    apartments: FALLBACK_PLOT_SIZES_APARTMENTS,
    villas: FALLBACK_PLOT_SIZES_VILLAS,
  });

  const [selectedType, setSelectedType] = useState(FALLBACK_PROPERTY_TYPES[0]);
  const [selectedFacings, setSelectedFacings] = useState<string[]>([]);
  const [selectedBhk, setSelectedBhk] = useState<string | null>(null);
  const [selectedPlotSize, setSelectedPlotSize] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const currentPlotSizes = useMemo(
    () => plotSizesForType(selectedType, plotSizeLists),
    [selectedType, plotSizeLists],
  );

  // GET /filter-options -> { group_key: [{ value, minValue, maxValue }] }
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const data = await contentApi.getFilterOptions();
        const values = (key: string) =>
          (data[key] ?? []).map((o) => o.value).filter(Boolean);

        const types = values("property_type");
        const facingValues = values("facing");
        const bhk = values("bhk");
        const prices = values("price_range");

        const bounds: Record<string, PriceBounds> = {};
        for (const option of data["price_range"] ?? []) {
          if (!option.value) continue;
          bounds[option.value] = {
            minPrice: option.minValue,
            maxPrice: option.maxValue,
          };
        }

        if (types.length) {
          setPropertyTypes(types);
          setSelectedType((current) =>
            types.includes(current) ? current : types[0],
          );
        }
        if (facingValues.length) setFacings(facingValues);
        if (bhk.length) setBhkOptions(bhk);
        if (prices.length) setPriceRanges(prices);
        if (Object.keys(bounds).length) setPriceBounds(bounds);

        setPlotSizeLists((current) => ({
          default: values("plot_size_default").length
            ? values("plot_size_default")
            : current.default,
          agri: values("plot_size_agriculture_lands").length
            ? values("plot_size_agriculture_lands")
            : current.agri,
          farm: values("plot_size_farmlands").length
            ? values("plot_size_farmlands")
            : current.farm,
          residential: values("plot_size_residential_house").length
            ? values("plot_size_residential_house")
            : current.residential,
          apartments: values("plot_size_apartments").length
            ? values("plot_size_apartments")
            : current.apartments,
          villas: values("plot_size_villas").length
            ? values("plot_size_villas")
            : current.villas,
        }));
      } catch {
        // Keep the fallback lists already in state.
      }
    };
    loadFilterOptions();
  }, []);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        setFaqs(await contentApi.getFaqs("Buy Properties"));
      } catch {
        setFaqs([]);
      }
    };
    loadFaqs();
  }, []);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof propertiesApi.getProperties>[0] = {
        page: 1,
        limit: 50,
        propertyType: selectedType,
      };

      if (selectedPrice) {
        const bounds = priceBounds[selectedPrice];
        if (bounds?.minPrice != null) params.minPrice = bounds.minPrice;
        if (bounds?.maxPrice != null) params.maxPrice = bounds.maxPrice;
      }
      if (selectedPlotSize) params.plotSize = selectedPlotSize;
      if (selectedFacings.length) params.facing = selectedFacings.join(",");
      // No dedicated BHK filter exists on the backend, so the app falls back
      // to a text match. A typed query wins over the BHK chip when both are set.
      const freeText = searchText.trim() || selectedBhk;
      if (freeText) params.search = freeText;

      const response = await propertiesApi.getProperties(params);
      setProperties(response.data ?? []);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [
    selectedType,
    selectedPrice,
    selectedPlotSize,
    selectedFacings,
    selectedBhk,
    searchText,
    priceBounds,
  ]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const clearFilters = () => {
    setSelectedFacings([]);
    setSelectedBhk(null);
    setSelectedPlotSize(null);
    setSelectedPrice(null);
    setSearchText("");
  };

  const activeFilterCount =
    (selectedFacings.length ? 1 : 0) +
    (selectedBhk ? 1 : 0) +
    (selectedPlotSize ? 1 : 0) +
    (selectedPrice ? 1 : 0);

  const toggleFacing = (facing: string) =>
    setSelectedFacings((current) =>
      current.includes(facing)
        ? current.filter((f) => f !== facing)
        : [...current, facing],
    );

  const filterPanel = (
    <div className="space-y-6">
      <FilterGroup
        label="Price range"
        options={priceRanges}
        selected={selectedPrice}
        onSelect={(v) => setSelectedPrice(v === selectedPrice ? null : v)}
      />
      <FilterGroup
        label="Plot size"
        options={currentPlotSizes}
        selected={selectedPlotSize}
        onSelect={(v) => setSelectedPlotSize(v === selectedPlotSize ? null : v)}
      />
      <FilterGroup
        label="BHK"
        options={bhkOptions}
        selected={selectedBhk}
        onSelect={(v) => setSelectedBhk(v === selectedBhk ? null : v)}
      />
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">Facing</p>
        <div className="flex flex-wrap gap-2">
          {facings.map((facing) => {
            const active = selectedFacings.includes(facing);
            return (
              <button
                key={facing}
                type="button"
                onClick={() => toggleFacing(facing)}
                aria-pressed={active}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? "bg-[#1d2567] text-white border-[#1d2567]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#1d2567]"
                }`}
              >
                {facing}
              </button>
            );
          })}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-semibold text-red-500 hover:text-red-600"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            aria-label="Back to home"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-7 h-7 text-black" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-black">
            Buy Property
          </h1>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by title or location"
            className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none focus:border-[#1d2567]"
          />
        </div>

        {/* Property type chips */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto pb-2 mb-4">
          {propertyTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setSelectedType(type);
                setSelectedPlotSize(null);
              }}
              aria-pressed={selectedType === type}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                selectedType === type
                  ? "bg-[#1d2567] text-white border-[#1d2567]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#1d2567]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Mobile filter trigger */}
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#1d2567]"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-[#1d2567] px-2 py-0.5 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 flex gap-8">
        {/* Desktop filter rail */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-28 rounded-2xl border border-gray-100 bg-white p-6">
            <p className="text-base font-semibold text-gray-900 mb-5">
              Filters
            </p>
            {filterPanel}
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {loading ? "Searching..." : `${properties.length} properties`}
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[220px] w-full rounded-xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-gray-500">
              No properties found
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {properties.map((property) => (
                <PropertyResultCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* FAQs, matching the app's "FAQs - Buy Property" section */}
          {faqs.length > 0 && (
            <div className="mt-14">
              <h2 className="text-lg sm:text-xl font-semibold text-[#1d2567] mb-5">
                FAQs: Buy Property
              </h2>
              <div className="space-y-3">
                {[...faqs]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((faq) => (
                    <div
                      key={faq.id}
                      className="rounded-2xl border border-gray-100 bg-white overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaqId(openFaqId === faq.id ? null : faq.id)
                        }
                        className="w-full px-5 py-4 text-left font-semibold text-gray-900"
                      >
                        {faq.question}
                      </button>
                      {openFaqId === faq.id && (
                        <p className="px-5 pb-4 text-gray-600 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-lg font-semibold text-gray-900">Filters</p>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterPanel}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="mt-8 w-full rounded-xl bg-[#1d2567] py-3.5 font-semibold text-white"
            >
              Show {properties.length} results
            </button>
          </div>
        </div>
      )}

      <Contact />
      <Footer />
    </main>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-semibold text-gray-900 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              aria-pressed={active}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? "bg-[#1d2567] text-white border-[#1d2567]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#1d2567]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
