"use client";

import { Search, MapPin, SlidersHorizontal, ChevronDown } from "lucide-react";

export default function LatestListingsHero() {
  return (
    <section className="relative w-full pt-28 pb-12 md:pt-0 md:pb-0 md:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/explore/explore-hero.png"
          alt="Latest Listings Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl text-white font-bold mb-2">Latest Listings</h1>
        <p className="text-white text-base md:text-lg text-center mb-6 md:mb-8">
          Discover Curated Plots Across Prime Locations
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl bg-white rounded-lg flex items-center px-4 py-3 md:px-6 md:py-4 mb-4 md:mb-6 shadow-xl">
          <MapPin className="text-[#1d2567] w-6 h-6 mr-3" />
          <input
            type="text"
            placeholder="Near Gayatri Mandir, Noida, Sector 34..."
            className="flex-1 min-w-0 outline-none text-gray-700 text-base md:text-lg placeholder:text-gray-400"
          />
          <Search className="text-gray-400 w-6 h-6 ml-3" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
          <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20 hover:bg-white/20 transition-colors">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M3 21H21M5 21V7H9V21M11 21V3H15V21M17 21V11H21V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium">Plot size</span>
            <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </button>

          <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20 hover:bg-white/20 transition-colors">
            <span className="text-white font-serif italic text-sm">₹</span>
            <span className="text-sm font-medium">Min - Max range</span>
            <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </button>

          <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20 hover:bg-white/20 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Category</span>
            <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </button>
        </div>
      </div>
    </section>
  );
}
