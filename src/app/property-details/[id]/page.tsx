"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SuccessModal from "@/components/SuccessModal";
import {
  MapPin,
  Heart,
  Share2,
  ArrowLeft,
  Layout,
  Home,
  Clock,
  CalendarCheck,
  Download,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { propertiesApi, Property, enquiriesApi } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function PropertyDetailsPage() {
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { requireAuth } = useRequireAuth();

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;

      try {
        setLoading(true);
        // First try standard property API
        try {
          const data = await propertiesApi.getPropertyById(propertyId);
          setProperty(data);
        } catch {
          // Fallback to latest listings API
          console.log(
            "Standard property fetch failed, trying latest listings API...",
          );
          const data = await propertiesApi.getLatestListingById(propertyId);
          setProperty(data);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  // Record the view so this property feeds the home page's Recently Viewed
  // rail and its Most Viewed ranking, as the app does on its detail screen.
  useEffect(() => {
    if (!propertyId) return;
    propertiesApi.trackView(propertyId);
  }, [propertyId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white font-sans text-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#2e3675] mx-auto mb-4" />
            <p className="text-gray-500">Loading property details...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen bg-white font-sans text-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              {error || "Property not found"}
            </p>
            <Link
              href="/explore-results"
              className="px-6 py-2 bg-[#2e3675] text-white rounded-lg hover:bg-[#1d2567] transition-colors"
            >
              Back to Listings
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const images =
    property.images?.length > 0
      ? property.images
      : ["https://placehold.co/800x600/e2e8f0/1e293b?text=Property"];

  const handleDownloadBrochure = () => {
    if (property.brochureUrl) {
      window.open(property.brochureUrl, "_blank");
    }
  };

  const handleEnquiry = async () => {
    if (!propertyId || enquiryLoading) return;
    if (!requireAuth()) return;

    try {
      setEnquiryLoading(true);
      await enquiriesApi.submit({
        type: "PROPERTY",
        propertyId: propertyId,
        message: "I'd like to know more about this property.",
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error submitting enquiry:", err);
      alert("Failed to submit enquiry. Please try again.");
    } finally {
      setEnquiryLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Top Navbar for Detail Page */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/explore-results"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Detail</h1>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <Share2 className="w-6 h-6 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <Heart className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Left Column: Image Gallery & Project Info (3/5 width) */}
          <div className="lg:col-span-3">
            {/* Gallery */}
            <div className="mb-8">
              {/* Main Image */}
              <div className="relative h-[400px] w-full mb-4 rounded-3xl overflow-hidden shadow-sm bg-gray-100">
                <Image
                  src={images[activeImage]}
                  alt={property.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {property.isFeatured && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 rounded-full text-sm font-semibold text-white">
                    Featured
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative h-28 rounded-2xl overflow-hidden bg-gray-100 hover:opacity-90 transition-all cursor-pointer ${
                        activeImage === idx ? "ring-2 ring-[#2e3675]" : ""
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Project Details */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {property.title}
              </h2>
              <div className="text-blue-500 font-medium text-lg mb-2">
                Land | {property.priceRange}
              </div>
              <div className="text-gray-600 mb-1">{property.subtitle}</div>
              <div className="flex items-center text-gray-500">
                <MapPin className="w-4 h-4 mr-1" />
                {property.locationAddress ||
                  `${property.city}, ${property.state}`}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadBrochure}
                disabled={!property.brochureUrl}
                className={`flex-1 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  property.brochureUrl
                    ? "bg-[#F7AE49] hover:bg-[#e6a03e] text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Download Brochure
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleEnquiry}
                disabled={enquiryLoading}
                className="flex-1 font-semibold py-4 rounded-xl transition-colors text-center cursor-pointer flex items-center justify-center gap-2 bg-[#2e3675] hover:bg-[#232958] text-white disabled:opacity-70"
              >
                {enquiryLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Enquire about it"
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Layout & Pricing (2/5 width) */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50/50 rounded-3xl p-6 h-full border border-gray-100">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-2">
                  {property.landLayoutTitle || "Land Layout and Pricing"}
                </h3>
                <span className="bg-[#F7AE49] text-white text-xs px-3 py-1.5 rounded-md font-medium">
                  {property.overviewFields?.find((f) =>
                    f.label.toLowerCase().includes("type"),
                  )?.value || "Residential land"}
                </span>
              </div>

              {/* Layout Map */}
              <div className="relative w-full aspect-[3/4] bg-white rounded-xl overflow-hidden border border-gray-200">
                {property.landLayoutImageUrl ? (
                  <Image
                    src={property.landLayoutImageUrl}
                    alt="Layout Map"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                    <div className="text-center">
                      <Layout className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <span className="text-sm">Layout Map</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <section className="bg-gray-100 rounded-3xl p-8 mb-8">
          <h3 className="text-gray-700 font-medium mb-8">
            {property.title} - Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            {property.overviewFields?.map((field, index) => (
              <div key={field.id || index} className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shrink-0">
                  {field.label.toLowerCase().includes("size") ? (
                    <Layout className="w-6 h-6 text-gray-400" />
                  ) : field.label.toLowerCase().includes("type") ? (
                    <Home className="w-6 h-6 text-gray-400" />
                  ) : field.label.toLowerCase().includes("date") ? (
                    <CalendarCheck className="w-6 h-6 text-gray-400" />
                  ) : field.label.toLowerCase().includes("status") ? (
                    <Clock className="w-6 h-6 text-gray-400" />
                  ) : (
                    <Layout className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{field.label}</p>
                  <p className="text-[#2e3675] font-medium">{field.value}</p>
                </div>
              </div>
            ))}

            {/* Default fields if no overview fields */}
            {(!property.overviewFields ||
              property.overviewFields.length === 0) && (
              <>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shrink-0">
                    <MapPin className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Location</p>
                    <p className="text-[#2e3675] font-medium">
                      {property.city}, {property.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shrink-0">
                    <Home className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Price Range</p>
                    <p className="text-[#2e3675] font-medium">
                      {property.priceRange}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* More About Section */}
        {property.descriptionContent && (
          <section className="bg-gray-100 rounded-3xl p-8 mb-20">
            <h3 className="font-bold text-gray-800 mb-4">
              {property.descriptionTitle || `More about ${property.title}`}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {property.descriptionContent}
            </p>
          </section>
        )}
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
