"use client";

import { ChevronDown, Loader2, X } from "lucide-react";
import { useState } from "react";
import {
  landProtectionApi,
  LandProtectionRequestData,
  LAND_AREA_UNITS,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import SuccessModal from "@/components/SuccessModal";

export default function LandProtectionForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    countryCode: "+91",
    location: "",
    landAreaValue: "",
    areaUnit: LAND_AREA_UNITS[0],
    pincode: "",
  });

  const [surveyNumberInput, setSurveyNumberInput] = useState("");
  const [surveyNumbers, setSurveyNumbers] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "fullName" && /[^a-zA-Z\s]/.test(value)) return;
    if (name === "phone" && value !== "" && !/^\d*$/.test(value)) return;
    if (name === "pincode" && value !== "" && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSurveyNumber = () => {
    const sn = surveyNumberInput.trim();
    if (sn && !surveyNumbers.includes(sn)) {
      setSurveyNumbers((prev) => [...prev, sn]);
    }
    setSurveyNumberInput("");
  };

  const removeSurveyNumber = (sn: string) => {
    setSurveyNumbers((prev) => prev.filter((n) => n !== sn));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.location.trim() ||
      !formData.landAreaValue.trim() ||
      !formData.pincode.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters");
      return;
    }
    if (formData.phone.trim().length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (formData.location.trim().length < 2) {
      setError("Location must be at least 2 characters");
      return;
    }
    if (formData.pincode.trim().length !== 6) {
      setError("Enter a valid 6-digit pincode");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const landArea = `${formData.landAreaValue.trim()} ${formData.areaUnit}`;

      const submitData: LandProtectionRequestData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        countryCode: formData.countryCode,
        landLocation: formData.location.trim(),
        landArea,
        location: formData.location.trim(),
        pincode: formData.pincode.trim(),
        surveyNumbers: surveyNumbers.length > 0 ? surveyNumbers : undefined,
      };

      await landProtectionApi.requestQuote(submitData);
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
    <div className="max-w-xl mx-auto mb-20">
      {/* Header - Outside the box */}
      <div className="text-center mb-10">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Land Protection
        </h1>
        <p className="text-gray-500">Connect with us to protect your land</p>
      </div>

      {/* Box Form */}
      <section className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
        {/* Form Content */}
        <div className="w-full">
          <div className="mb-8">
            <h2 className="text-lg text-center font-semibold text-gray-800 mb-1">
              Get your plan & price
            </h2>
            <p className="text-gray-500 text-center text-sm mb-8">
              Enter your details here to register
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Full name */}
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
                required
              />

              {/* Mobile Number with Country Code */}
              <div className="flex gap-2">
                <div className="relative w-24 flex-shrink-0">
                  <div className="w-full border border-gray-200 rounded-xl px-2 py-4 flex items-center justify-center gap-1 bg-white">
                    <div className="w-6 h-4 rounded-sm overflow-hidden relative flex flex-col">
                      <div className="bg-[#FF9933] h-1/3 w-full"></div>
                      <div className="bg-white h-1/3 w-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-blue-800 rounded-full"></div>
                      </div>
                      <div className="bg-[#138808] h-1/3 w-full"></div>
                    </div>
                    <span className="text-sm text-gray-600">+91</span>
                  </div>
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  className="flex-1 border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
                  required
                />
              </div>

              {/* Location (submitted as both landLocation and location) */}
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
                required
              />

              {/* Land Area + Unit */}
              <div className="flex gap-3">
                <input
                  type="text"
                  name="landAreaValue"
                  value={formData.landAreaValue}
                  onChange={handleChange}
                  placeholder="Land Area"
                  inputMode="decimal"
                  className="flex-[3] border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
                  required
                />
                <div className="relative flex-[2]">
                  <select
                    name="areaUnit"
                    value={formData.areaUnit}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white appearance-none cursor-pointer"
                  >
                    {LAND_AREA_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Pincode */}
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                maxLength={6}
                inputMode="numeric"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
                required
              />

              {/* Survey Numbers (optional) */}
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={surveyNumberInput}
                    onChange={(e) => setSurveyNumberInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSurveyNumber();
                      }
                    }}
                    placeholder="Survey Number (optional)"
                    className="flex-1 border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
                  />
                  <button
                    type="button"
                    onClick={addSurveyNumber}
                    className="px-5 rounded-xl border border-[#2D336B] text-[#2D336B] font-medium hover:bg-[#2D336B]/5 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {surveyNumbers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {surveyNumbers.map((sn) => (
                      <span
                        key={sn}
                        className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full"
                      >
                        {sn}
                        <button
                          type="button"
                          onClick={() => removeSurveyNumber(sn)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#2D336B] hover:bg-[#1f2455] disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Get your price"
            )}
          </button>
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
