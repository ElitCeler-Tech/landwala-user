"use client";

import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import LegalVerificationForm from "@/components/LegalVerificationForm";

export default function LegalVerificationPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="pt-24 pb-12 md:py-12 px-4">
        <LegalVerificationForm />
      </div>

      <Contact />
      <Footer />
    </main>
  );
}
