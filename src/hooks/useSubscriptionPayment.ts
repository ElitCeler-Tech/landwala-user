"use client";

import { useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { subscriptionPurchaseApi } from "@/lib/api";
export const useSubscriptionPayment = () => {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async (planId: string) => {
    setLoading(true);
    try {
      const order = await subscriptionPurchaseApi.createOrder(planId);

      if (order && order.paymentSessionId) {
        const cashfree = await load({
          // Must match the backend's CASHFREE_ENV. Defaults to sandbox.
          mode:
            process.env.NEXT_PUBLIC_CASHFREE_MODE === "production"
              ? "production"
              : "sandbox",
        });

        await cashfree.checkout({
          paymentSessionId: order.paymentSessionId,
          redirectTarget: "_self",
        });
      } else {
        console.error("Failed to create order", order);
        alert("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
};
