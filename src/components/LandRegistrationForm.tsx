"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { landRegistrationApi, LandRegistrationSubmitData } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import SuccessModal from "@/components/SuccessModal";

export default function LandRegistrationForm() {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    countryCode: "+91",
    email: "",
    location: "",
    plotType: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (!formData.name || !formData.phone || !formData.email) {
      setError("Please fill in all required fields");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!requireAuth()) return;

    if (!formData.location || !formData.plotType) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const submitData: LandRegistrationSubmitData = {
        name: formData.name,
        phone: formData.phone,
        countryCode: formData.countryCode,
        email: formData.email,
        location: formData.location,
        plotType: formData.plotType,
        message: formData.message || undefined,
      };

      await landRegistrationApi.submit(submitData);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccess(false);
    router.push("/");
  };

  return (
    <div className="max-w-xl mx-auto mb-8 md:mb-20">
      {/* Header - Outside the box */}
      <div className="text-center mb-6 md:mb-10">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Land Registration
        </h1>
        <p className="text-gray-500">
          Get in Touch for Land Registration Assistance
        </p>
      </div>

      {/* Box Form */}
      <section className="bg-white rounded-3xl shadow-2xl p-5 md:p-12 border border-gray-100 min-h-[600px] flex flex-col">
        {/* Form Content */}
        <div className="w-full flex-grow">
          <div className="mb-8 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Basic Details
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Enter your details here to register
            </p>

            {/* Progress Bar */}
            <div className="flex items-center justify-center gap-2 mb-10">
              <div className="flex flex-col items-center">
                <div
                  className={`h-1.5 w-24 rounded-full mb-2 ${
                    step >= 1 ? "bg-[#1d2567]" : "bg-gray-200"
                  }`}
                ></div>
                <span
                  className={`text-[10px] font-bold ${
                    step >= 1 ? "text-[#1d2567]" : "text-gray-400"
                  }`}
                >
                  Basic Information
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`h-1.5 w-24 rounded-full mb-2 ${
                    step >= 2 ? "bg-[#1d2567]" : "bg-gray-200"
                  }`}
                ></div>
                <span
                  className={`text-[10px] font-bold ${
                    step >= 2 ? "text-[#1d2567]" : "text-gray-400"
                  }`}
                >
                  Plot Information
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              {/* Full Name */}
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
              />

              {/* Mobile Number */}
              <div className="flex w-full border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#2D336B] transition-colors bg-white">
                <div className="flex items-center px-3 md:px-4 border-r border-gray-200 gap-1.5 md:gap-2 bg-gray-50/10">
                  <div className="w-6 h-4 relative rounded-sm overflow-hidden bg-gray-100 flex flex-col">
                    <div className="bg-[#FF9933] h-1/3 w-full"></div>
                    <div className="bg-white h-1/3 w-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-blue-800 rounded-full"></div>
                    </div>
                    <div className="bg-[#138808] h-1/3 w-full"></div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  className="flex-1 min-w-0 md:min-w-auto px-4 md:px-5 py-4 text-gray-700 outline-none font-normal"
                />
              </div>

              {/* Email Id */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E mail Id"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
              />

              <button
                onClick={handleNextStep}
                className="w-full bg-[#2D336B] text-white font-semibold py-4 rounded-xl shadow-lg hover:bg-[#1f2455] transition-colors text-lg mt-8"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Location */}
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
              />

              {/* Type of Plot */}
              <div className="relative">
                <select
                  name="plotType"
                  value={formData.plotType}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Type of Plot
                  </option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Agricultural">Agricultural</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Message */}
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Additional message (optional)"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal resize-none"
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#2D336B] hover:bg-[#1f2455] disabled:bg-gray-400 text-white font-semibold py-4 rounded-xl shadow-lg transition-colors text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Enquiry"
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleModalClose}
        title="Your Request has been Sent"
        message="We will notify you once the Admin accepts your request"
      />
    </div>
  );
}
