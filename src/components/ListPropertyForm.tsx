"use client";

import { useState, useRef } from "react";
import { CloudUpload, ChevronDown, Loader2, X } from "lucide-react";
import {
  propertySubmissionApi,
  PROPERTY_CATEGORIES,
  UNITS_BY_CATEGORY,
  PROPERTY_FACINGS,
} from "@/lib/api";
import SuccessModal from "@/components/SuccessModal";

const PLOT_LOCATION_CATEGORIES = [
  "Open Plots",
  "Agriculture Land",
  "Farmlands",
  "Farmhouse",
];

const initialFormState = {
  listingType: "Sell (New)",
  category: "",
  title: "",
  location: "",
  pincode: "",
  plotLocation: "",
  size: "",
  unit: "",
  price: "",
  priceNegotiable: "" as "" | "Yes" | "No",
  facing: "",
  description: "",
};

export default function ListPropertyForm() {
  const [formData, setFormData] = useState(initialFormState);

  const [images, setImages] = useState<File[]>([]);
  const [layoutImages, setLayoutImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const layoutImageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const availableUnits = formData.category
    ? UNITS_BY_CATEGORY[formData.category] ?? []
    : [];

  const showPlotLocationField = PLOT_LOCATION_CATEGORIES.includes(
    formData.category,
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "title") {
      // Letters and spaces only, matching the app's name validation
      if (/[^a-zA-Z\s]/.test(value)) return;
    }
    if (name === "size") {
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    }

    setFormData((prev) => {
      if (name === "category") {
        const units = UNITS_BY_CATEGORY[value] ?? [];
        return {
          ...prev,
          category: value,
          unit: value === "Apartments" ? "Sq. Ft" : units.length === 1 ? units[0] : "",
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "layout" | "document"
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (type === "image") setImages((prev) => [...prev, ...newFiles]);
      else if (type === "layout") setLayoutImages((prev) => [...prev, ...newFiles]);
      else setDocuments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number, type: "image" | "layout" | "document") => {
    if (type === "image") setImages((prev) => prev.filter((_, i) => i !== index));
    else if (type === "layout") setLayoutImages((prev) => prev.filter((_, i) => i !== index));
    else setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.title.trim() ||
      !formData.category ||
      !formData.location.trim() ||
      !formData.size.trim() ||
      !formData.unit ||
      !formData.price.trim() ||
      !formData.priceNegotiable ||
      !formData.facing
    ) {
      setError("Please fill in all mandatory fields.");
      return;
    }
    if (images.length === 0) {
      setError("Please upload at least one property image.");
      return;
    }

    setLoading(true);
    try {
      await propertySubmissionApi.submit({
        title: formData.title.trim(),
        category: formData.category,
        listingType: formData.listingType,
        size: formData.size.trim(),
        unit: formData.unit,
        facing: formData.facing,
        price: formData.price.trim(),
        priceNegotiable: formData.priceNegotiable as "Yes" | "No",
        description: formData.description.trim() || undefined,
        location: formData.location.trim(),
        pincode: formData.pincode.trim() || undefined,
        plotLocation: formData.plotLocation.trim() || undefined,
        image: images,
        layoutImage: layoutImages,
        documents: documents,
      });

      setShowSuccess(true);
      setFormData(initialFormState);
      setImages([]);
      setLayoutImages([]);
      setDocuments([]);
    } catch (err) {
      console.error("Submission failed", err);
      setError("Failed to submit property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-20">
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Property Listed Successfully!"
        message="Your property details have been submitted for review."
      />

      <div className="text-center mb-10">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          List Your Property
        </h1>
        <p className="text-gray-500">Add details here to list your property</p>
      </div>

      <section className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-8">
            <h2 className="text-lg text-center font-semibold text-gray-800 mb-1">
              Basic Details
            </h2>
            <p className="text-gray-500 text-center text-sm mb-8">
              Enter your details here to list your Plot
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Listing Type */}
              <div className="flex gap-3">
                {["Sell (New)", "Resale (Old)"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, listingType: type }))}
                    className={`flex-1 py-3 rounded-xl border font-medium transition-colors ${
                      formData.listingType === type
                        ? "bg-[#2D336B] text-white border-[#2D336B]"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Category */}
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {PROPERTY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Name (submitted as title) */}
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Name"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
                required
              />

              {/* Location */}
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
                required
              />

              {/* Pincode */}
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Pincode"
                maxLength={6}
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
              />

              {/* Plot Location / Landmark - conditional */}
              {showPlotLocationField && (
                <input
                  type="text"
                  name="plotLocation"
                  value={formData.plotLocation}
                  onChange={handleInputChange}
                  placeholder="Plot Location / Landmark"
                  className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
                />
              )}

              {/* Size + Unit */}
              <div className="flex gap-3">
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="Plot Size"
                  className="flex-[3] border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
                  required
                />
                <div className="relative flex-[2]">
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white appearance-none cursor-pointer"
                    required
                    disabled={!formData.category}
                  >
                    <option value="" disabled>
                      Unit
                    </option>
                    {availableUnits.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Price */}
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Price (₹)"
                inputMode="numeric"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
                required
              />

              {/* Price Negotiable */}
              <div className="relative">
                <select
                  name="priceNegotiable"
                  value={formData.priceNegotiable}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Price Negotiable
                  </option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Facing */}
              <div className="relative">
                <select
                  name="facing"
                  value={formData.facing}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Facing
                  </option>
                  {PROPERTY_FACINGS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Description (Optional) */}
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description (Optional)"
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal resize-none"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Property Images *
            </label>
            <input
              type="file"
              ref={imageInputRef}
              onChange={(e) => handleFileChange(e, "image")}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-[#2D336B]/30 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <CloudUpload className="w-8 h-8 text-[#2D336B] mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-gray-900 font-medium mb-1">
                {images.length > 0
                  ? `${images.length} file(s) selected`
                  : "Upload Property Images"}
              </p>
              <span className="text-[#2D336B] font-bold text-sm">
                Browse Files
              </span>
            </div>
            {images.length > 0 && (
              <div className="mt-4 space-y-2">
                {images.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg text-sm border border-gray-100"
                  >
                    <span className="text-gray-600 truncate max-w-[80%]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index, "image")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Layout Image Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Layout Images (optional)
            </label>
            <input
              type="file"
              ref={layoutImageInputRef}
              onChange={(e) => handleFileChange(e, "layout")}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => layoutImageInputRef.current?.click()}
              className="border-2 border-dashed border-[#2D336B]/30 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <CloudUpload className="w-8 h-8 text-[#2D336B] mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-gray-900 font-medium mb-1">
                {layoutImages.length > 0
                  ? `${layoutImages.length} file(s) selected`
                  : "Upload Layout Images"}
              </p>
              <span className="text-[#2D336B] font-bold text-sm">
                Browse Files
              </span>
            </div>
            {layoutImages.length > 0 && (
              <div className="mt-4 space-y-2">
                {layoutImages.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg text-sm border border-gray-100"
                  >
                    <span className="text-gray-600 truncate max-w-[80%]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index, "layout")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Upload */}
          <div className="mb-10">
            <label className="block text-gray-700 font-medium mb-2">
              Documents (optional — PDF, JPG, DOC)
            </label>
            <input
              type="file"
              ref={documentInputRef}
              onChange={(e) => handleFileChange(e, "document")}
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
            />
            <div
              onClick={() => documentInputRef.current?.click()}
              className="border-2 border-dashed border-[#2D336B]/30 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <CloudUpload className="w-8 h-8 text-[#2D336B] mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-gray-900 font-medium mb-1">
                {documents.length > 0
                  ? `${documents.length} file(s) selected`
                  : "Upload Documents"}
              </p>
              <span className="text-[#2D336B] font-bold text-sm">
                Browse Files
              </span>
            </div>
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {documents.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg text-sm border border-gray-100"
                  >
                    <span className="text-gray-600 truncate max-w-[80%]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index, "document")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D336B] text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-[#1f2455] transition-colors text-lg disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Add Property"
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
