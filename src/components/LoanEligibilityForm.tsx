"use client";

import { ChevronDown, CloudUpload, Loader2, X } from "lucide-react";
import { useState } from "react";
import { loanApi, LoanApplicationData } from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import SuccessModal from "@/components/SuccessModal";

export default function LoanEligibilityForm() {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<{
    fullName: string;
    monthlyIncome: string;
    employmentType: string;
    loanPurpose: string;
    desiredAmount: string;
    pincode: string; // Not in API type but in UI
  }>({
    fullName: "",
    monthlyIncome: "",
    employmentType: "",
    loanPurpose: "",
    desiredAmount: "",
    pincode: "",
  });

  const [tenure, setTenure] = useState(25);
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!requireAuth()) return;

    if (
      !formData.fullName ||
      !formData.monthlyIncome ||
      !formData.employmentType ||
      !formData.loanPurpose ||
      !formData.desiredAmount
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const applicationData: LoanApplicationData = {
        fullName: formData.fullName,
        monthlyIncome: formData.monthlyIncome,
        employmentType: formData.employmentType,
        loanPurpose: formData.loanPurpose,
        desiredAmount: formData.desiredAmount,
        loanTenureYears: tenure.toString(),
        documents: files,
      };

      await loanApi.apply(applicationData);

      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccess(false);
    router.push("/loan-eligibility");
  };

  return (
    <div className="max-w-xl mx-auto mb-8 md:mb-20">
      {/* Header - Outside the box */}
      <div className="text-center mb-6 md:mb-10">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Check Loan Eligibility
        </h1>
        <p className="text-gray-500">
          Find out how much property loan you qualify for.
        </p>
      </div>

      {/* Box Form */}
      <section className="bg-white rounded-3xl shadow-2xl p-5 md:p-12 border border-gray-100">
        {/* Form Content */}
        <div className="w-full">
          <div className="mb-8">
            <h2 className="text-lg text-center font-semibold text-gray-800 mb-1">
              Get Custom Quote
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
              />

              {/* Monthly Income */}
              <input
                type="text"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="Monthly Income (₹ input)"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
              />

              {/* Employment Type */}
              <div className="relative">
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Employment Type
                  </option>
                  <option value="Salaried">Salaried</option>
                  <option value="Self Employed">Self Employed</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Loan Purpose */}
              <div className="relative">
                <select
                  name="loanPurpose"
                  value={formData.loanPurpose}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Loan Purpose
                  </option>
                  {/* Values must match the backend LoanPurpose enum:
                      HOME, PERSONAL, BUSINESS, EDUCATION, VEHICLE, OTHER. */}
                  <option value="HOME">Home Loan</option>
                  <option value="BUSINESS">Business / Commercial Loan</option>
                  <option value="PERSONAL">Personal Loan</option>
                  <option value="OTHER">Other (incl. Land Loan)</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Desired Amount */}
              <input
                type="text"
                name="desiredAmount"
                value={formData.desiredAmount}
                onChange={handleChange}
                placeholder="Desired Amount"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
              />

              {/* Pincode */}
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white font-normal"
              />
            </div>
          </div>

          {/* Upload Documents */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">
              Upload Documents
            </label>
            <div className="border-2 border-dashed border-[#2D336B]/30 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group relative">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <CloudUpload className="w-8 h-8 text-[#2D336B] mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-gray-900 font-medium mb-1 text-center">
                PAN, Aadhar, Income Proof
              </p>
              <span className="text-[#2D336B] font-bold text-sm">
                Browse Files
              </span>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-lg"
                  >
                    <span className="truncate max-w-[200px] text-gray-700">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loan Tenure */}
          <div className="mb-10">
            <label className="block text-gray-700 font-medium mb-4">
              Loan Tenure
            </label>
            <div className="relative bg-gray-200 rounded-xl px-4 py-8">
              {/* Range Slider Track & Thumb visual - Simplified using standard input for functionality ideally but styling to match image */}
              <div className="w-full relative">
                <style jsx>{`
                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    background: #1d2567;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    cursor: pointer;
                    margin-top: -8px;
                  }
                  input[type="range"]::-moz-range-thumb {
                    background: #1d2567;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                  }
                  input[type="range"]::-webkit-slider-runnable-track {
                    background: transparent;
                  }
                `}</style>
                <div className="flex justify-between text-sm font-bold text-black mb-4 w-full px-1">
                  <span>0 years</span>
                  <span>50 years</span>
                </div>
                {/* Range Input */}
                <div className="relative w-full h-1 bg-gray-300 rounded-full">
                  {/* Track Background logic */}
                  <div
                    className="absolute top-0 left-0 h-1 bg-[#1d2567] rounded-full"
                    style={{ width: `${(tenure / 50) * 100}%` }}
                  ></div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="absolute top-0 left-0 w-full h-1 opacity-100 cursor-pointer z-10"
                    style={{
                      background: "transparent",
                      WebkitAppearance: "none",
                    }}
                  />
                </div>
                <div className="text-center mt-4 font-semibold text-[#1d2567] text-lg">
                  {tenure} Years
                </div>
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
              "Check Eligibility"
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
