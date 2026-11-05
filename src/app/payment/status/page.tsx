"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { subscriptionPurchaseApi } from "@/lib/api";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    orderId ? "loading" : "failed",
  );
  const [message, setMessage] = useState(orderId ? "" : "Invalid order ID.");

  useEffect(() => {
    if (!orderId) return;

    const verifyPayment = async () => {
      try {
        const response = await subscriptionPurchaseApi.verifyOrder(orderId);
        // The backend returns { orderId, orderStatus, isPaid, ... }.
        if (response.isPaid === true || response.orderStatus === "PAID") {
          setStatus("success");
          setMessage("Your subscription has been successfully activated.");
        } else {
          setStatus("failed");
          setMessage(response.message || "Payment verification failed.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
        setMessage("An error occurred while verifying the payment.");
      }
    };

    verifyPayment();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#1d2567]" />
            <p className="text-gray-600 font-medium">Verifying payment...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Payment Successful!
            </h2>
            <p className="text-gray-500">{message}</p>
            <div className="mt-4 space-y-3 w-full">
              <Link
                href="/profile"
                className="block w-full bg-[#1d2567] text-white py-3 rounded-lg font-medium hover:bg-[#151b4d] transition-colors"
                replace
              >
                Go to Profile
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-gray-500">{message}</p>
            <div className="mt-4 space-y-3 w-full">
              <Link
                href="/test-payment"
                className="block w-full bg-[#1d2567] text-white py-3 rounded-lg font-medium hover:bg-[#151b4d] transition-colors"
                replace
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                replace
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1d2567]" />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
