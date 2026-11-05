"use client";

import {
  CloudUpload,
  ChevronLeft,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { legalVerificationApi, LegalVerificationData } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import SuccessModal from "@/components/SuccessModal";

export default function LegalVerificationForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [documents, setDocuments] = useState<{
    titleDeed: File | null;
    saleAgreement: File | null;
    taxReceipt: File | null;
    ec: File | null;
  }>({
    titleDeed: null,
    saleAgreement: null,
    taxReceipt: null,
    ec: null,
  });

  const fileInputRefs = {
    titleDeed: useRef<HTMLInputElement>(null),
    saleAgreement: useRef<HTMLInputElement>(null),
    taxReceipt: useRef<HTMLInputElement>(null),
    ec: useRef<HTMLInputElement>(null),
  };

  const handleFileChange = (
    field: keyof typeof documents,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments((prev) => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleRemoveFile = (field: keyof typeof documents) => {
    setDocuments((prev) => ({ ...prev, [field]: null }));
    if (fileInputRefs[field].current) {
      fileInputRefs[field].current!.value = "";
    }
  };

  const triggerFileInput = (field: keyof typeof documents) => {
    fileInputRefs[field].current?.click();
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (
      !documents.titleDeed &&
      !documents.saleAgreement &&
      !documents.taxReceipt &&
      !documents.ec
    ) {
      setError("Please upload at least one document");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data: LegalVerificationData = {
        titleDeed: documents.titleDeed,
        saleAgreement: documents.saleAgreement,
        taxReceipt: documents.taxReceipt,
        encumbranceCertificate: documents.ec,
      };

      await legalVerificationApi.apply(data);
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

  const renderUploadBox = (label: string, field: keyof typeof documents) => {
    const file = documents[field];

    return (
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">{label}</label>
        <input
          type="file"
          ref={fileInputRefs[field]}
          onChange={(e) => handleFileChange(field, e)}
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
        />
        {file ? (
          <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="text-red-500 w-6 h-6" />
              </div>
              <span className="text-gray-900 font-medium text-sm md:text-base truncate max-w-[150px] sm:max-w-xs">
                {file.name}
              </span>
            </div>
            <button
              onClick={() => handleRemoveFile(field)}
              className="w-10 h-10 bg-[#1d2567] rounded-full flex items-center justify-center hover:bg-[#151b4d] transition-colors"
            >
              <Trash2 className="text-white w-5 h-5" />
            </button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-[#2D336B]/30 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={() => triggerFileInput(field)}
          >
            <CloudUpload className="w-8 h-8 text-[#2D336B] mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-gray-500 text-sm mb-1 text-center">
              Accepted formats: PDF, JPG, PNG.
            </p>
            <span className="text-[#2D336B] font-bold text-sm">
              Browse Files
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto mb-8 md:mb-20">
      <section className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Upload Documents</h1>
        </div>

        <p className="text-gray-500 text-sm mb-8">
          Accepted formats: PDF, JPG, PNG.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="w-full">
          {renderUploadBox("Title Deed", "titleDeed")}
          {renderUploadBox("Sale Agreement", "saleAgreement")}
          {renderUploadBox("Tax Receipt", "taxReceipt")}
          {renderUploadBox("Encumbrance Certificate (EC)", "ec")}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1d2567] hover:bg-[#151b4d] disabled:bg-gray-400 text-white font-semibold py-4 rounded-full shadow-lg transition-colors text-base mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Verification"
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
