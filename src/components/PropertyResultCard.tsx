"use client";

import { Heart, MapPin, Ruler, Grid3X3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/lib/api";
import { useWishlist } from "@/hooks/useWishlist";

interface LegacyPropertyProps {
  id?: string | number;
  image: string;
  priceRange: string;
  location: string;
  pricePerSqft?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
}

function isApiProperty(
  property: Property | LegacyPropertyProps,
): property is Property {
  return "title" in property && "locationAddress" in property;
}

export default function PropertyResultCard({
  property,
}: {
  property: Property | LegacyPropertyProps;
}) {
  const isApi = isApiProperty(property);
  const id = isApi ? property.id : property.id || "1";
  const image = isApi
    ? property.images?.[0] ||
      "https://placehold.co/600x400/e2e8f0/1e293b?text=Property"
    : property.image;
  const title = isApi ? property.title : "Property";
  const priceRange = isApi ? property.priceRange : property.priceRange;
  const location = isApi
    ? property.locationAddress || `${property.city}, ${property.state}`
    : property.location;

  const sizeField = isApi
    ? property.overviewFields?.find((f) =>
        f.label.toLowerCase().includes("size"),
      )
    : null;
  const typeField = isApi
    ? property.overviewFields?.find((f) =>
        f.label.toLowerCase().includes("type"),
      )
    : null;
  const area = sizeField?.value || (isApi ? undefined : property.area);
  const propertyType = typeField?.value || "Land";

  // Shared hook so the heart reflects what is actually saved and can also
  // un-favourite, matching the app. Legacy (non-API) cards have no real id,
  // so their heart stays inert.
  const { isWishlisted: isSaved, toggle } = useWishlist("PROPERTY");
  const isWishlisted = isApi && property.id ? isSaved(property.id) : false;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isApi || !property.id) return;
    toggle(property.id);
  };

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden transition-shadow duration-300 border border-gray-100 ">
      <Link
        href={`/property-details/${id}`}
        className="md:w-2/5 relative rounded-xl h-64 md:h-auto block min-h-[200px]"
      >
        <div className="relative rounded-xl w-full h-full overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            unoptimized
          />
          {isApi && property.isFeatured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 rounded-full text-xs font-semibold text-white">
              Featured
            </div>
          )}
        </div>
      </Link>

      <div className="p-6 md:w-3/5 flex flex-col justify-between relative">
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <Heart
            className={`w-6 h-6 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
          />
        </button>

        <div>
          <Link href={`/property-details/${id}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-1 hover:text-[#2e3675] transition-colors line-clamp-1 pr-10">
              {title}
            </h3>
          </Link>

          <p className="text-[#2e3675] text-2xl font-bold mb-2">{priceRange}</p>

          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
            <p className="text-sm line-clamp-1">{location}</p>
          </div>

          {isApi && property.subtitle && (
            <p className="text-xs text-gray-500 mb-4 line-clamp-1">
              {property.subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-4 text-gray-500 text-sm mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Grid3X3 className="w-4 h-4 text-[#2e3675]" />
            <span className="text-gray-700">{propertyType}</span>
          </div>
          {area && (
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Ruler className="w-4 h-4 text-[#2e3675]" />
              <span className="text-gray-700">{area}</span>
            </div>
          )}
          {isApi && property.city && (
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <MapPin className="w-4 h-4 text-[#2e3675]" />
              <span className="text-gray-700">{property.city}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
