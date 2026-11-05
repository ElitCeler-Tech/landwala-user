"use client";

import Header from "@/components/Header";
import LoanEligibilityForm from "@/components/LoanEligibilityForm";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function CheckLoanEligibilityPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="pt-24 pb-12 md:py-12 px-4 bg-gray-50/30">
        <LoanEligibilityForm />
      </div>

      <Contact />
      <Footer />
    </main>
  );
}
