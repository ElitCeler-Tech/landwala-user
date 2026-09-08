"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SuccessModal from "@/components/SuccessModal";
import {
  layoutsApi,
  Layout,
  LayoutSlot,
  enquiriesApi,
  wishlistApi,
} from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  MapPin,
  Loader2,
  Grid3X3,
  Share2,
  Heart,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const svgHoverStyles = `
    .svg-plot-group {
        cursor: pointer;
        transition: transform 0.3s ease, filter 0.3s ease, opacity 0.3s ease;
        transform-origin: center center;
        transform-box: fill-box;
    }
    .svg-plot-group:hover {
        transform: scale(1.15);
        filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.8)) brightness(1.1);
    }
    .svg-plot-group:hover path,
    .svg-plot-group:hover rect,
    .svg-plot-group:hover polygon {
        fill: rgba(59, 130, 246, 0.6) !important;
        stroke: #2563eb !important;
        stroke-width: 2px !important;
    }
    .svg-plot-group.selected {
        transform: scale(1.15);
        filter: drop-shadow(0 0 16px rgba(37, 99, 235, 0.9)) brightness(1.15);
    }
    .svg-plot-group.selected path,
    .svg-plot-group.selected rect,
    .svg-plot-group.selected polygon {
        fill: rgba(37, 99, 235, 0.7) !important;
        stroke: #1d4ed8 !important;
        stroke-width: 3px !important;
    }
    .svg-container {
        transition: transform 0.3s ease;
        transform-origin: center center;
    }
`;

export default function LayoutDetailsPage() {
  const params = useParams();
  const layoutId = params.id as string;

  const [layout, setLayout] = useState<Layout | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<LayoutSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPlots, setShowPlots] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgLoading, setSvgLoading] = useState(false);
  const [selectedPlotNumber, setSelectedPlotNumber] = useState<string | null>(
    null,
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  // ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    const fetchLayout = async () => {
      if (!layoutId) return;

      try {
        setLoading(true);
        const data = await layoutsApi.getLayoutById(layoutId);
        setLayout(data);
      } catch (err) {
        console.error("Error fetching layout:", err);
        setError("Failed to load layout details");
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, [layoutId]);

  // Fetch and process SVG content
  useEffect(() => {
    const fetchAndProcessSvg = async () => {
      if (!layout?.layoutImageUrl) return;

      try {
        setSvgLoading(true);
        // Use proxy API to avoid CORS issues when fetching from S3
        const proxyUrl = `/api/proxy-svg?url=${encodeURIComponent(layout.layoutImageUrl)}`;
        const response = await fetch(proxyUrl);
        const svgText = await response.text();

        // Parse the SVG
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");

        if (svgElement) {
          // Find all groups that match the pattern:
          // - id starts with "g" followed by numbers (e.g., g4107)
          // - has inkscape:label attribute with "plot" followed by a number
          const allGroups = svgElement.querySelectorAll("g[id]");

          allGroups.forEach((group) => {
            const id = group.getAttribute("id");
            const inkscapeLabel = group.getAttribute("inkscape:label");

            // Check if id matches pattern g followed by numbers
            const idMatches = id && /^g\d+$/.test(id);

            // Check if inkscape:label matches "plot" followed by numbers
            const labelMatches =
              inkscapeLabel && /^plot\s*\d+$/i.test(inkscapeLabel);

            if (idMatches && labelMatches) {
              // Add the hover class and data attribute
              group.classList.add("svg-plot-group");

              // Store the full inkscape:label value for matching with slot data
              // e.g., "plot 1", "plot 2", etc.
              group.setAttribute(
                "data-plot-label",
                inkscapeLabel.toLowerCase().trim(),
              );
            }
          });

          // Add responsive styles to SVG
          svgElement.setAttribute("width", "100%");
          svgElement.setAttribute("height", "auto");
          svgElement.style.maxWidth = "100%";

          // Serialize back to string
          const serializer = new XMLSerializer();
          const modifiedSvg = serializer.serializeToString(svgElement);
          setSvgContent(modifiedSvg);
        }
      } catch (err) {
        console.error("Error fetching SVG:", err);
        // Fallback to image if SVG fetch fails
        setSvgContent(null);
      } finally {
        setSvgLoading(false);
      }
    };

    fetchAndProcessSvg();
  }, [layout?.layoutImageUrl]);

  // Handle click on SVG plot groups
  const handleSvgClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as Element;
      const plotGroup = target.closest(".svg-plot-group");

      if (plotGroup) {
        const plotLabel = plotGroup.getAttribute("data-plot-label");
        setSelectedPlotNumber(plotLabel);

        // Find the corresponding slot from the layout data
        // Match by plotNumber (case-insensitive) as it lines up with SVG labels
        if (layout && plotLabel) {
          const slot = layout.slots.find(
            (s) =>
              s.plotNumber.toString().toLowerCase().trim() ===
              plotLabel.toLowerCase().trim(),
          );
          if (slot) {
            setSelectedSlot(slot);
          }
        }

        // Remove selected class from all groups
        document.querySelectorAll(".svg-plot-group.selected").forEach((el) => {
          el.classList.remove("selected");
        });

        // Add selected class to clicked group
        plotGroup.classList.add("selected");

        // Close fullscreen mode if open (don't force showPlots anymore)
        setIsFullscreen(false);
      }
    },
    [layout],
  );

  const { requireAuth } = useRequireAuth();

  const handleWishlist = async () => {
    if (!layout) return;
    if (!requireAuth()) return;
    try {
      setWishlistLoading(true);
      await wishlistApi.add({
        type: "LAYOUT",
        layoutId: layout.id,
      });
      setIsWishlisted(true);
    } catch (err) {
      console.error("Error adding to wishlist:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleEnquiry = async (slot: LayoutSlot) => {
    if (enquiryLoading || !layout) return;
    if (!requireAuth()) return;

    try {
      setEnquiryLoading(true);
      await enquiriesApi.submit({
        type: "LAYOUT",
        layoutId: layout.id,
        slotId: slot.id,
        message: "I'd like to know more.",
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error submitting enquiry:", err);
      alert("Failed to submit enquiry. Please try again.");
    } finally {
      setEnquiryLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "sold":
        return "bg-red-500";
      case "not_available":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "sold":
        return "Sold";
      case "not_available":
        return "Not Available";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white font-sans text-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#2e3675] mx-auto mb-4" />
            <p className="text-gray-500">Loading layout details...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !layout) {
    return (
      <main className="min-h-screen bg-white font-sans text-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">{error || "Layout not found"}</p>
            <Link
              href="/layouts/explore"
              className="px-6 py-2 bg-[#2e3675] text-white rounded-lg hover:bg-[#1d2567] transition-colors"
            >
              Back to Layouts
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-black">Layouts</h1>
        </div>

        {/* 1. Layout Summary Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-3 shadow-sm flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="relative w-full md:w-[450px] h-[280px] rounded-2xl overflow-hidden shrink-0">
            <Image
              src={layout.imageUrl}
              alt={layout.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 w-full p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {layout.title}
                </h2>
                <p className="text-gray-500 text-lg mb-8">{layout.location}</p>
                <p className="text-black font-bold text-xl">
                  Land | {layout.priceRange}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Share2 className="w-6 h-6 text-gray-600" />
                </button>
                <button
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Heart
                    className={`w-6 h-6 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 2. Left Column: Map & Selector */}
          <div className="lg:col-span-2">
            {/* Inject SVG hover styles */}
            <style dangerouslySetInnerHTML={{ __html: svgHoverStyles }} />

            {/* Toggle between Visual Map and Plot Selection */}
            <LayoutGroup>
              {/* Fullscreen Overlay */}
              <AnimatePresence>
                {isFullscreen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) toggleFullscreen();
                    }}
                  >
                    <motion.div
                      layoutId="svg-map-container"
                      className="relative w-full h-full max-w-[95vw] max-h-[95vh] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200"
                    >
                      {/* Fullscreen Controls */}
                      <div className="absolute top-4 right-4 z-30 flex gap-2">
                        <div className="flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200">
                          <button
                            onClick={handleZoomIn}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={handleZoomOut}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                          </button>
                          <div className="h-px bg-gray-200 my-1" />
                          <button
                            onClick={handleZoomReset}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="Reset Zoom"
                          >
                            <RotateCcw className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                          </button>
                          <div className="text-xs text-center text-gray-500 font-medium">
                            {Math.round(zoomLevel * 100)}%
                          </div>
                        </div>
                        <button
                          onClick={toggleFullscreen}
                          className="h-fit p-3 bg-white/90 backdrop-blur-sm hover:bg-red-50 rounded-xl transition-colors group shadow-lg border border-gray-200"
                          title="Exit Fullscreen"
                        >
                          <X className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                        </button>
                      </div>

                      {/* Fullscreen SVG Content */}
                      <div className="overflow-auto w-full h-full cursor-grab active:cursor-grabbing p-4">
                        <div
                          onClick={handleSvgClick}
                          className="svg-container w-full min-w-fit"
                          style={{
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: "top left",
                          }}
                          dangerouslySetInnerHTML={{ __html: svgContent || "" }}
                        />
                      </div>

                      {/* Fullscreen Hint */}
                      {!selectedSlot && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-full">
                          Press ESC or click outside to exit • Hover over plots
                          to see them
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Normal View Container */}
              <motion.div
                layoutId={!isFullscreen ? "svg-map-container" : undefined}
                className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 mb-8 w-full"
              >
                {!showPlots ? (
                  /* Interactive SVG Map */
                  <div className="relative">
                    {/* Zoom Controls */}
                    {svgContent && (
                      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200">
                        <button
                          onClick={handleZoomIn}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        </button>
                        <button
                          onClick={handleZoomOut}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        </button>
                        <div className="h-px bg-gray-200 my-1" />
                        <button
                          onClick={handleZoomReset}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="Reset Zoom"
                        >
                          <RotateCcw className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        </button>
                        <div className="h-px bg-gray-200 my-1" />
                        <button
                          onClick={toggleFullscreen}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                          title="Fullscreen"
                        >
                          <Maximize2 className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                        </button>
                        <div className="text-xs text-center text-gray-500 font-medium">
                          {Math.round(zoomLevel * 100)}%
                        </div>
                      </div>
                    )}

                    {svgLoading ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2e3675]" />
                      </div>
                    ) : svgContent ? (
                      <div className="overflow-auto max-h-[600px] cursor-grab active:cursor-grabbing">
                        <div
                          onClick={handleSvgClick}
                          className="svg-container w-full min-w-fit"
                          style={{
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: "top left",
                          }}
                          dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                      </div>
                    ) : (
                      /* Fallback to Image if SVG fetch fails */
                      <Image
                        src={layout.layoutImageUrl}
                        alt={`${layout.title} Map`}
                        width={1200}
                        height={800}
                        className="w-full h-auto object-contain"
                        unoptimized
                      />
                    )}

                    {/* Hint overlay */}
                    {svgContent && !selectedSlot && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-full">
                        Hover over plots to see them • Click to select
                      </div>
                    )}
                  </div>
                ) : (
                  /* Plot Selection Grid */
                  <div className="bg-white p-6">
                    {/* Header with back button */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-800">
                        Select a Plot
                      </h3>
                      <button
                        onClick={() => setShowPlots(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2e3675] bg-[#2e3675]/10 hover:bg-[#2e3675]/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                        View Layout Image
                      </button>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-600">Sold</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span className="text-sm text-gray-600">
                          Not Available
                        </span>
                      </div>
                    </div>

                    {/* Plot Grid */}
                    {Object.entries(layout.slotsBySection).map(
                      ([section, slots]) => (
                        <div key={section} className="mb-8 last:mb-0">
                          <h4 className="text-md font-semibold text-gray-700 mb-4">
                            {section}
                          </h4>
                          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {slots.map((slot) => (
                              <button
                                key={slot.id}
                                onClick={() => setSelectedSlot(slot)}
                                disabled={slot.status !== "available"}
                                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                                  selectedSlot?.id === slot.id
                                    ? "bg-[#2e3675] text-white shadow-lg scale-110 z-10"
                                    : slot.status === "available"
                                      ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
                                      : slot.status === "sold"
                                        ? "bg-red-50 text-red-400 border border-red-100 cursor-not-allowed"
                                        : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                }`}
                              >
                                {slot.plotNumber}
                              </button>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </motion.div>
            </LayoutGroup>
          </div>

          {/* 3. Right Column: Sticky Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedSlot ? (
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 uppercase">
                    PLOT NO : {selectedSlot.plotNumber}
                  </h3>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start text-gray-700 font-medium">
                      <span className="w-24 shrink-0 text-gray-900">
                        Size :
                      </span>
                      <span>
                        {selectedSlot.width && selectedSlot.height ? (
                          <>
                            {selectedSlot.width} X {selectedSlot.height}
                          </>
                        ) : null}{" "}
                        ({selectedSlot.area})
                      </span>
                    </div>
                    <div className="flex items-start text-gray-700 font-medium">
                      <span className="w-24 shrink-0 text-gray-900">
                        Facing :
                      </span>
                      <span>{selectedSlot.facing}</span>
                    </div>
                    <div className="flex items-start text-gray-700 font-medium">
                      <span className="w-24 shrink-0 text-gray-900">
                        Status :
                      </span>
                      <span
                        className={`${
                          selectedSlot.status === "available"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {getStatusText(selectedSlot.status)}
                      </span>
                    </div>
                    <div className="flex items-start text-gray-700 font-medium">
                      <span className="w-24 shrink-0 text-gray-900">
                        Price :
                      </span>
                      <span>{selectedSlot.priceFormatted}</span>
                    </div>
                  </div>

                  {selectedSlot.status === "available" && (
                    <button
                      onClick={() => handleEnquiry(selectedSlot)}
                      disabled={enquiryLoading}
                      className="w-full bg-[#2e3675] hover:bg-[#232958] text-white font-medium py-3.5 rounded-lg transition-colors shadow-lg cursor-pointer disabled:opacity-70"
                    >
                      {enquiryLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Request Details"
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center">
                  <Grid3X3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Select a Plot
                  </h3>
                  <p className="text-gray-500">
                    Click on a plot number from the grid to view its details and
                    pricing.
                  </p>

                  {/* Legend Reminder */}
                  <div className="mt-8 pt-6 border-t border-gray-200 text-left">
                    <p className="text-sm font-semibold mb-3">Statistics:</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Total Plots:</span>
                        <span className="font-medium text-gray-900">
                          {layout.totalSlots}
                        </span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span>Available:</span>
                        <span className="font-medium">
                          {layout.availableSlots}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Contact />
      <Footer />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Your Enquiry has been Sent"
        message="We will notify you once the Admin responds to your enquiry"
      />
    </main>
  );
}
