"use client";

import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function QuoteSuccessPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <Header />

      <div className="flex-grow flex flex-col items-center justify-center pt-28 pb-20 px-4">
        <h1 className="text-2xl font-semibold text-black mb-16">
          My Verifications
        </h1>

        <div className="flex flex-col items-center text-center max-w-lg">
          {/* Illustration */}
          <div className="relative w-64 h-64 mb-8">
            <Image
              src="/verifications.svg"
              alt="Verifications Illustration"
              fill
              className="object-contain"
            />
          </div>

          <h2 className="text-2xl font-bold text-black mb-4">
            Your Request Quote is submitted!
          </h2>
          <p className="text-gray-500 text-lg">
            Our Legal Team will reach to you within 48–72 hours.
          </p>
        </div>
      </div>

      <Contact />
      <Footer />
    </main>
  );
}
