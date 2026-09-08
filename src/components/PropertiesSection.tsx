"use client";

import { useState, useEffect } from "react";
import { propertiesApi, Property, PropertiesResponse } from "@/lib/api";
import { useWishlist } from "@/hooks/useWishlist";
import Link from "next/link";

export type PropertiesVariant =
  | "nearby"
  | "featured"
  | "recently-viewed"
  | "trending"
  | "hot-sale"
  | "most-viewed";

const FETCHERS: Record<
  PropertiesVariant,
  (limit: number) => Promise<PropertiesResponse>
> = {
  nearby: (limit) => propertiesApi.getProperties({ limit }),
  featured: (limit) => propertiesApi.getFeaturedListings({ limit, page: 1 }),
  "recently-viewed": (limit) => propertiesApi.getRecentlyViewed(limit),
  trending: (limit) => propertiesApi.getTrending({ limit, page: 1 }),
  "hot-sale": (limit) => propertiesApi.getHotSale({ limit, page: 1 }),
  "most-viewed": (limit) => propertiesApi.getMostViewed(limit),
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 42 42"
      fill={filled ? "currentColor" : "none"}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32.755 15.1308C32.3985 13.9747 31.7599 12.8885 30.7806 11.9175C30.0095 11.1531 29.2093 10.6489 28.4064 10.3438M17.9276 7.14743C15.0422 5.31713 10.3824 3.58636 6.35826 7.69012C-3.19433 17.4317 13.1875 36.2035 20.6871 36.2035C28.1866 36.2035 44.5685 17.4317 35.0159 7.69012C30.9918 3.58641 26.332 5.31715 23.4467 7.14744C21.8163 8.18163 19.5579 8.18163 17.9276 7.14743Z"
        stroke="currentColor"
        strokeWidth="2.58597"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PropertyCard({
  prop,
  isWishlisted,
  onToggleWishlist,
  className = "",
}: {
  prop: Property;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  className?: string;
}) {
  return (
    <Link
      href={`/property-details/${prop.id}`}
      className={`group relative h-[260px] sm:h-[300px] w-full rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer ${className}`}
    >
      <img
        src={
          prop.images?.[0] ||
          "https://placehold.co/600x400/556655/FFFFFF?text=Property"
        }
        alt={prop.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {prop.isFeatured && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 rounded-full text-xs font-semibold text-white">
          Featured
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white z-10">
        <div className="flex justify-between items-end gap-3">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold mb-1 tracking-wide line-clamp-1">
              {prop.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 font-normal mb-2 line-clamp-1">
              {prop.locationAddress || `${prop.city}, ${prop.state}`}
            </p>
            <span className="font-bold text-xs sm:text-sm tracking-wide">
              Land | {prop.priceRange}
            </span>
          </div>

          <button
            type="button"
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            aria-pressed={isWishlisted}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(prop.id);
            }}
            className={`shrink-0 transition-colors mb-1 ${
              isWishlisted
                ? "text-orange-500"
                : "text-white hover:text-orange-500"
            }`}
          >
            <HeartIcon filled={isWishlisted} />
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function PropertiesSection({
  title = "Explore Nearby Properties",
  showViewAll = true,
  isFeatured = false,
  variant,
  tag,
  layout = "grid",
  limit,
  id,
}: {
  title?: string;
  showViewAll?: boolean;
  /** @deprecated pass variant="featured" instead. Kept so existing callers work. */
  isFeatured?: boolean;
  variant?: PropertiesVariant;
  /** Small emoji/label pill shown next to the heading, as in the app. */
  tag?: string;
  layout?: "grid" | "rail";
  limit?: number;
  id?: string;
}) {
  const resolvedVariant: PropertiesVariant =
    variant ?? (isFeatured ? "featured" : "nearby");
  const resolvedLimit = limit ?? (layout === "rail" ? 10 : 3);

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isWishlisted, toggle } = useWishlist("PROPERTY");

  useEffect(() => {
    let cancelled = false;
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await FETCHERS[resolvedVariant](resolvedLimit);
        if (cancelled) return;
        setProperties(response.data ?? []);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error(`Error fetching ${resolvedVariant} properties:`, err);
        setError("Failed to load properties");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProperties();
    return () => {
      cancelled = true;
    };
  }, [resolvedVariant, resolvedLimit]);

  const heading = (
    <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-black truncate">
          {title}
        </h2>
        {tag && (
          <span className="hidden sm:inline-flex shrink-0 items-center rounded-full bg-[#E9EBEF] px-3 py-1 text-xs font-semibold text-[#1d2567]">
            {tag}
          </span>
        )}
      </div>
      {showViewAll && (
        <Link
          href="/latest-listings"
          className="shrink-0 text-sm font-medium text-[#1d2567] hover:text-orange-500"
        >
          View all
        </Link>
      )}
    </div>
  );

  if (loading) {
    return (
      <section id={id} className="py-8 sm:py-12 max-w-7xl mx-auto bg-white">
        <div className="container mx-auto px-4 md:px-6">
          {heading}
          <div
            className={
              layout === "rail"
                ? "flex gap-4 overflow-hidden"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            }
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-[260px] sm:h-[300px] rounded-2xl bg-gray-200 animate-pulse ${
                  layout === "rail"
                    ? "w-[260px] sm:w-[320px] shrink-0"
                    : "w-full"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // The app hides an empty rail rather than showing an empty state, so the
  // home page never carries a dead "Hot Sale" heading with nothing under it.
  if (layout === "rail" && (error || properties.length === 0)) {
    return null;
  }

  if (error) {
    return (
      <section id={id} className="py-8 sm:py-12 max-w-7xl mx-auto bg-white">
        <div className="container mx-auto px-4 md:px-6">
          {heading}
          <div className="text-center py-12 text-gray-500">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="py-8 sm:py-12 max-w-7xl mx-auto bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {heading}

        {layout === "rail" ? (
          <div className="-mx-4 px-4 md:mx-0 md:px-0 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:thin]">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="w-[260px] sm:w-[320px] shrink-0 snap-start"
              >
                <PropertyCard
                  prop={prop}
                  isWishlisted={isWishlisted(prop.id)}
                  onToggleWishlist={toggle}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No properties found
              </div>
            ) : (
              properties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  prop={prop}
                  isWishlisted={isWishlisted(prop.id)}
                  onToggleWishlist={toggle}
                />
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
