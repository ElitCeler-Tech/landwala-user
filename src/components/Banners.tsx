"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bannersApi, Banner } from "@/lib/api";

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannersApi.getBanners();
        if (response.data) {
          const sortedBanners = response.data.sort(
            (a, b) => a.displayOrder - b.displayOrder,
          );
          setBanners(sortedBanners);
        }
      } catch (error) {
        console.error("Failed to fetch banners", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleBannerClick = (banner: Banner) => {
    if (
      banner.type === "PROPERTY" &&
      (banner.propertyId || banner.property?.id)
    ) {
      const id = banner.propertyId || banner.property?.id;
      router.push(`/property-details/${id}`);
    } else if (
      banner.type === "LAYOUT" &&
      (banner.layoutId || banner.layout?.id)
    ) {
      const id = banner.layoutId || banner.layout?.id;
      router.push(`/layouts/${id}`);
    }
  };

  const getImageSrc = (banner: Banner) => {
    if (banner.type === "PROPERTY") {
      if (banner.property?.images && banner.property.images.length > 0) {
        return banner.property.images[0];
      }
      return (
        banner.property?.landLayoutImageUrl ||
        banner.property?.brochureUrl ||
        ""
      );
    } else if (banner.type === "LAYOUT") {
      return banner.layout?.imageUrl || banner.layout?.layoutImageUrl || "";
    }
    return "";
  };

  const getTitle = (banner: Banner) => {
    if (banner.type === "PROPERTY") return banner.property?.title;
    if (banner.type === "LAYOUT") return banner.layout?.title;
    return null;
  };

  const getSubtitle = (banner: Banner) => {
    if (banner.type === "PROPERTY") return banner.property?.subtitle;
    return null;
  };

  // Take no space until there is something to show. A spinner block here
  // pushed the hero down and sat empty whenever the API was slow or down.
  if (loading) return null;

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden bg-gray-900 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 cursor-pointer"
          onClick={() => handleBannerClick(banners[currentIndex])}
        >
          {getImageSrc(banners[currentIndex]) ? (
            <Image
              src={getImageSrc(banners[currentIndex])}
              alt="Banner"
              fill
              className="object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-300"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
              No Image Available
            </div>
          )}

          {/* Text Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-12">
            <div className="text-center text-white p-4 max-w-4xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg transform transition-transform duration-500 translate-y-0">
                {getTitle(banners[currentIndex])}
              </h2>
              {getSubtitle(banners[currentIndex]) && (
                <p className="text-lg md:text-xl font-medium drop-shadow-md text-gray-200">
                  {getSubtitle(banners[currentIndex])}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/50 w-2 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
