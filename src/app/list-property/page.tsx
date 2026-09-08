"use client";

import Link from "next/link";
import Header from "@/components/Header";
import ListPropertyForm from "@/components/ListPropertyForm";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function ListPropertyPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="py-12 px-4 bg-gray-50/30">
        {/* The app's Sell Property screen offers My Submissions alongside the
            form, so the same shortcut lives here. */}
        <div className="max-w-4xl mx-auto mb-6 flex justify-end">
          <Link
            href="/my-listings"
            className="text-sm font-semibold text-[#1d2567] hover:text-orange-500"
          >
            My Submissions
          </Link>
        </div>
        <ListPropertyForm />
      </div>

      <Contact />
      <Footer />
    </main>
  );
}
