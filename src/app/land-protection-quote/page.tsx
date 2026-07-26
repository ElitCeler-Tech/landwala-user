"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { ChevronDown, Loader2, X, Check } from "lucide-react";
import {
  landProtectionApi,
  paymentsApi,
  pincodeApi,
  convertToSqYards,
  getPlanForSqYards,
  exceedsMaxLandSize,
  LandPricingPlan,
  LAND_AREA_UNITS,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const PENDING_KEY = "landProtectionPendingRequest";

interface PendingRequest {
  fullName: string;
  phone: string;
  location: string;
  landArea: string;
  pincode: string;
  surveyNumbers: string[];
  planName: string;
}

function LandProtectionQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { isAuthenticated } = useAuthStore();

  const [step, setStep] = useState<
    "details" | "plan" | "verifying" | "success" | "team-will-contact"
  >("details");
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    location: "",
    landAreaValue: "",
    areaUnit: LAND_AREA_UNITS[0],
    pincode: "",
  });
  const [surveyNumberInput, setSurveyNumberInput] = useState("");
  const [surveyNumbers, setSurveyNumbers] = useState<string[]>([]);
  const [plan, setPlan] = useState<LandPricingPlan | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const submitRequest = useCallback(
    async (pending: PendingRequest, isOutOfRange: boolean) => {
      await landProtectionApi.requestQuote({
        fullName: pending.fullName,
        phone: pending.phone,
        countryCode: "+91",
        landLocation: pending.location,
        landArea: pending.landArea,
        location: pending.location,
        pincode: pending.pincode,
        surveyNumbers:
          pending.surveyNumbers.length > 0 ? pending.surveyNumbers : undefined,
        isOutOfRange: isOutOfRange || undefined,
      });
    },
    [],
  );

  // Returning from Cashfree checkout redirect
  useEffect(() => {
    if (!orderId) return;

    const verify = async () => {
      setStep("verifying");
      try {
        const raw = sessionStorage.getItem(PENDING_KEY);
        const pending: PendingRequest | null = raw ? JSON.parse(raw) : null;

        const result = await paymentsApi.verifyPayment(orderId);
        if (result.orderStatus !== "PAID") {
          setError(`Payment not confirmed. Status: ${result.orderStatus}`);
          setStep("details");
          return;
        }

        if (!pending) {
          setError(
            "Payment succeeded but we lost track of your request details. Please contact support with your order ID: " +
              orderId,
          );
          setStep("details");
          return;
        }

        await submitRequest(pending, false);
        sessionStorage.removeItem(PENDING_KEY);
        setStep("success");
      } catch (err) {
        console.error("Payment verification failed", err);
        setError("Payment succeeded but verification failed. Contact support.");
        setStep("details");
      }
    };

    verify();
  }, [orderId, submitRequest]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

  const handleContinue = async () => {
    setError("");
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

    setPaying(true);
    try {
      const servicePincodes = await pincodeApi.getAllServiceable();
      const pin = formData.pincode.trim();
      const isOutOfRange =
        servicePincodes.size > 0 && !servicePincodes.has(pin);

      const areaValue = parseFloat(formData.landAreaValue.trim()) || 0;
      const sqYards = convertToSqYards(areaValue, formData.areaUnit);
      const tooLarge = sqYards < 0 || exceedsMaxLandSize(areaValue, formData.areaUnit);
      const matchedPlan =
        !isOutOfRange && !tooLarge ? getPlanForSqYards(sqYards) : null;

      const pending: PendingRequest = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        landArea: `${formData.landAreaValue.trim()} ${formData.areaUnit}`,
        pincode: pin,
        surveyNumbers,
        planName: matchedPlan?.name ?? "",
      };

      if (!matchedPlan) {
        await submitRequest(pending, true);
        setStep("team-will-contact");
      } else {
        setPlan(matchedPlan);
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
        setStep("plan");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const handlePay = async () => {
    if (!plan) return;
    setPaying(true);
    setError("");
    try {
      const order = await paymentsApi.createOrder(
        plan.offer,
        `Land Protection - ${plan.name}`,
      );
      const cashfree = await load({ mode: "sandbox" });
      await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      console.error("Payment initiation failed", err);
      setError("Failed to start payment. Please try again.");
      setPaying(false);
    }
  };

  if (step === "verifying") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center pt-32">
        <Loader2 className="w-12 h-12 text-[#1d2567] animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Verifying your payment...</p>
      </div>
    );
  }

  if (step === "success" || step === "team-will-contact") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center pt-32 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Your Request has been Sent
        </h1>
        <p className="text-gray-500 max-w-md">
          {step === "success"
            ? "Payment received. We will notify you once the Admin accepts your request."
            : "Your land is outside our current service coverage or size range — our team will reach out to you shortly."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-8 bg-[#2D336B] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#1f2455] transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (step === "plan" && plan) {
    return (
      <div className="pt-32 pb-16 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Your Land Protection Plan
          </h1>
          <p className="text-gray-500">Based on your land area</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="rounded-3xl p-8 bg-[#0d1b4e] text-white shadow-xl">
          <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
          <p className="text-gray-300 text-sm mb-6">{plan.range}</p>
          <div className="mb-8">
            <span className="text-gray-400 line-through text-lg mr-2">
              ₹{plan.mrp.toLocaleString()}
            </span>
            <span className="text-3xl font-bold">
              ₹{plan.offer.toLocaleString()}
            </span>
          </div>
          <div className="space-y-4 mb-10">
            {plan.features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <Check className="w-5 h-5 shrink-0 text-blue-400" />
                <span className="text-sm text-gray-200">{feature}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-3.5 rounded-lg font-medium bg-[#4a5a9c] hover:bg-[#5b6bb0] text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {paying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₹${plan.offer.toLocaleString()}`
            )}
          </button>
          <button
            onClick={() => setStep("details")}
            className="w-full mt-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pt-32 pb-16 px-4">
      <div className="text-center mb-10">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Land Protection
        </h1>
        <p className="text-gray-500">Connect with us to protect your land</p>
      </div>

      <section className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
        <h2 className="text-lg text-center font-semibold text-gray-800 mb-1">
          Get your plan & price
        </h2>
        <p className="text-gray-500 text-center text-sm mb-8">
          Enter your details here to see your plan
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white"
          />

          <div className="flex gap-2">
            <div className="w-24 flex-shrink-0 border border-gray-200 rounded-xl px-2 py-4 flex items-center justify-center text-sm text-gray-600 bg-white">
              +91
            </div>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Mobile number"
              maxLength={10}
              inputMode="numeric"
              className="flex-1 border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white"
            />
          </div>

          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white"
          />

          <div className="flex gap-3">
            <input
              type="text"
              name="landAreaValue"
              value={formData.landAreaValue}
              onChange={handleChange}
              placeholder="Land Area"
              inputMode="decimal"
              className="flex-[3] border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white"
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
          {formData.areaUnit === "Acres" && (
            <p className="text-xs text-amber-600 -mt-2">
              For land measured in Acres, our team will contact you shortly.
            </p>
          )}

          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="Pincode"
            maxLength={6}
            inputMode="numeric"
            className="w-full border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white"
          />

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
                className="flex-1 border border-gray-200 rounded-xl px-5 py-4 text-gray-700 outline-none focus:border-[#2D336B] transition-colors bg-white"
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
                      onClick={() =>
                        setSurveyNumbers((prev) => prev.filter((n) => n !== sn))
                      }
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

        <button
          onClick={handleContinue}
          disabled={paying}
          className="w-full mt-8 bg-[#2D336B] hover:bg-[#1f2455] disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl shadow-lg transition-colors text-lg flex items-center justify-center gap-2"
        >
          {paying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking eligibility...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </section>
    </div>
  );
}

export default function LandProtectionQuotePage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />
      <Suspense
        fallback={
          <div className="min-h-screen flex justify-center items-center">
            <Loader2 className="w-12 h-12 text-[#1d2567] animate-spin" />
          </div>
        }
      >
        <LandProtectionQuoteContent />
      </Suspense>
      <Contact />
      <Footer />
    </main>
  );
}
