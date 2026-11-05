"use client";

import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import LandRegistrationForm from "@/components/LandRegistrationForm";

export default function LandRegistrationFormPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="pt-24 pb-12 md:pt-28 md:pb-12 px-4">
        <LandRegistrationForm />
      </div>

      <Contact />
      <Footer />
    </main>
  );
}
