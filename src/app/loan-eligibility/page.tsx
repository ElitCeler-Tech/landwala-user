"use client";

import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loanApi, LoanApplicationResponse } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function LoanEligibilityPage() {
  const { isAuthenticated } = useAuthStore();
  const [applications, setApplications] = useState<LoanApplicationResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (isAuthenticated) {
          const data = await loanApi.getApplications();
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchApplications();
    }
  }, [mounted, isAuthenticated]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <Header />

      <div className="flex-grow flex flex-col items-center pt-24 pb-10 md:pt-28 md:pb-20 px-4">
        <h1 className="text-2xl font-semibold text-black mb-8 md:mb-12 text-center">
          Loan Eligibility
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1d2567]" />
          </div>
        ) : applications.length > 0 ? (
          <div className="w-full max-w-4xl space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Applications</h2>
              <Link href="/check-loan-eligibility">
                <button className="bg-[#1d2567] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition-opacity text-sm">
                  New Application
                </button>
              </Link>
            </div>

            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-[#1d2567] mb-1">
                      {app.loanPurpose} Loan
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end gap-1">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{app.desiredAmount?.toLocaleString()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${app.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : app.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {app.status || "PENDING"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">
                      Tenure
                    </p>
                    <p className="font-medium">{app.loanTenureYears} Years</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">
                      Income
                    </p>
                    <p className="font-medium">
                      ₹{app.monthlyIncome?.toLocaleString()}/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">
                      Employment
                    </p>
                    <p className="font-medium capitalize">
                      {app.employmentType.toLowerCase()}
                    </p>
                  </div>
                  <div>{/* Placeholder for future actions */}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center max-w-xl">
            {/* Illustration */}
            <div className="relative w-72 h-64 mb-8">
              <Image
                src="/eligibility.svg"
                alt="Loan Eligibility Illustration"
                fill
                className="object-contain"
              />
            </div>

            <h2 className="text-2xl font-semibold text-black mb-3">
              No Loan Applications Yet
            </h2>
            <p className="text-gray-500 text-base md:text-lg mb-8 max-w-md">
              Check your eligibility and apply for property loans with trusted
              LandWalaa partners.
            </p>
            <Link href="/check-loan-eligibility">
              <button className="bg-[#1d2567] text-white px-12 py-4 rounded-full font-semibold shadow-xl hover:opacity-90 transition-opacity">
                Check Eligibility
              </button>
            </Link>
          </div>
        )}
      </div>

      <Contact />
      <Footer />
    </main>
  );
}
