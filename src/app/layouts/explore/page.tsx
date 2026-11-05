"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { layoutsApi, Layout } from "@/lib/api";
import {
    MapPin,
    Loader2,
    Grid3X3,
    Heart,
    Ruler,
    Maximize,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LayoutsExplorePage() {
    const [layouts, setLayouts] = useState<Layout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLayouts = async () => {
            try {
                setLoading(true);
                const response = await layoutsApi.getLayouts();
                setLayouts(response.data);
            } catch (err) {
                console.error("Error fetching layouts:", err);
                setError("Failed to load layouts");
            } finally {
                setLoading(false);
            }
        };

        fetchLayouts();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#2e3675] mx-auto mb-4" />
                        <p className="text-gray-500">Loading layouts...</p>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-[#2e3675] text-white rounded-lg hover:bg-[#1d2567] transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Header />

            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-12 md:py-12">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        All Layouts ({layouts.length})
                    </h2>
                </div>

                {layouts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Grid3X3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No layouts available</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {layouts.map((layout) => (
                            <div
                                key={layout.id}
                                className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden transition-all duration-300 border border-gray-100 group p-2"
                            >
                                {/* Image Section */}
                                <Link
                                    href={`/layouts/${layout.id}`}
                                    className="md:w-2/5 relative h-64 md:h-auto min-h-[220px] block overflow-hidden rounded-2xl"
                                >
                                    <Image
                                        src={layout.imageUrl}
                                        alt={layout.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        unoptimized
                                    />
                                    <div className="absolute top-4 left-4 bg-gradient-to-r from-[#2e3675] to-[#1d2567] px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md">
                                        RERA Approved
                                    </div>
                                </Link>

                                {/* Content Section */}
                                <div className="p-6 md:w-3/5 flex flex-col justify-between relative">
                                    <button className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors cursor-pointer z-10">
                                        <Heart className="w-6 h-6" />
                                    </button>

                                    <div>
                                        <Link href={`/layouts/${layout.id}`}>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-[#2e3675] transition-colors line-clamp-1 pr-10">
                                                {layout.title}
                                            </h3>
                                        </Link>

                                        <p className="text-[#2e3675] text-2xl font-bold mb-3">
                                            {layout.priceRange}
                                        </p>

                                        <div className="flex items-center text-gray-600 mb-4">
                                            <MapPin className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                                            <p className="text-sm line-clamp-1">{layout.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center flex-wrap gap-4 text-gray-500 text-sm mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <Grid3X3 className="w-4 h-4 text-[#2e3675]" />
                                            <span className="text-gray-700 font-medium">
                                                {layout.totalSlots} Plots
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                            <Ruler className="w-4 h-4 text-green-600" />
                                            <span className="text-green-700 font-medium">
                                                {layout.availableSlots} Available
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 ml-auto">
                                            <Maximize className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-500">View Layout</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Contact />
            <Footer />
        </main>
    );
}
