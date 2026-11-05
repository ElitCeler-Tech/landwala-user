"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { issueReportsApi } from "@/lib/api";
import SuccessModal from "@/components/SuccessModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ReportIssuePage() {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const issueCategories = [
    "UI/UX Issue",
    "Functionality Bug",
    "Performance Issue",
    "Content Error",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description) return;
    if (!requireAuth()) return;

    try {
      setLoading(true);
      await issueReportsApi.submit({
        title: category,
        description: description,
      });
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to submit report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.back();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="grow container mx-auto px-4 md:px-6 pt-24 pb-12 md:py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold text-center text-[#1d2567] mb-3 md:mb-4">
            Report a Bug
          </h1>
          <p className="text-gray-600 text-center mb-6 md:mb-10">
            Help us fix issues faster by submitting a quick report.
          </p>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Category */}
              <div className="space-y-2">
                <label className="text-base font-medium text-slate-700">
                  Issue Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1d2567]/20 focus:border-[#1d2567] transition-all cursor-pointer"
                    required
                  >
                    <option value="" disabled>
                      Select Issue Type
                    </option>
                    {issueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-base font-medium text-slate-700">
                  Describe The Problem
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what went wrong... e.g., screen not loading"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-gray-900 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-[#1d2567]/20 focus:border-[#1d2567] transition-all"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !category || !description}
                  className="w-full bg-[#1d2567] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#2e3675] active:scale-[0.99] transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-[#1d2567]/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Connect with us section */}
      <div className="-mb-16 relative z-20">
        <Contact />
      </div>

      <Footer />

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="Report Submitted"
        message="Thank you for your feedback. We will look into the issue shortly."
      />
    </div>
  );
}
