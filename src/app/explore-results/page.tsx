"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ExploreHero from "@/components/ExploreHero";
import PropertyResultCard from "@/components/PropertyResultCard";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import {
  propertiesApi,
  exploreCategoriesApi,
  Property,
  PropertiesMeta,
} from "@/lib/api";

export default function ExploreResultsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [meta, setMeta] = useState<PropertiesMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");

  // Admin-managed category chips, the same GET /explore-categories row the
  // app shows above its explore listing. Falls back to "All" only.
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const items = await exploreCategoriesApi.list();
        const names = items
          .map((c) => c.name)
          .filter((name) => name && name.length > 0);
        if (names.length) setCategories(["All", ...names]);
      } catch {
        // Leave the chip row with just "All".
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await propertiesApi.getProperties({
          page,
          limit: 10,
          ...(activeCategory === "All"
            ? {}
            : { propertyType: activeCategory }),
        });
        setProperties(response.data);
        setMeta(response.meta);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [page, activeCategory]);

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      <ExploreHero />

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {categories.length > 1 && (
          <div className="-mx-4 px-4 md:mx-0 md:px-0 flex gap-2 overflow-x-auto pb-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  setPage(1);
                }}
                aria-pressed={activeCategory === category}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                  activeCategory === category
                    ? "bg-[#2e3675] text-white border-[#2e3675]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#2e3675]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Search results {meta ? `(${meta.total})` : ""}
          </h2>
          {meta && (
            <p className="text-sm text-gray-500">
              Page {meta.page} of {meta.totalPages}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[200px] w-full rounded-xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => setPage(1)}
              className="px-6 py-2 bg-[#2e3675] text-white rounded-lg hover:bg-[#1d2567] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No properties found</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              {properties.map((prop) => (
                <PropertyResultCard key={prop.id} property={prop} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrevPage}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${meta.hasPrevPage
                      ? "bg-[#2e3675] text-white hover:bg-[#1d2567]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors cursor-pointer ${page === pageNum
                            ? "bg-[#2e3675] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.hasNextPage}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${meta.hasNextPage
                      ? "bg-[#2e3675] text-white hover:bg-[#1d2567]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Contact />
      <Footer />
    </main>
  );
}
