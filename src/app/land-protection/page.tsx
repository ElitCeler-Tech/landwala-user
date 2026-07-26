"use client";

import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ChevronLeft,
  ScanLine,
  ShieldCheck,
  FileCheck,
  MapPin,
  Camera,
  PaintBucket,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileCheck,
    title: "1. Ownership Verification",
    desc: "We help you confirm the registered owner of the property.",
  },
  {
    icon: MapPin,
    title: "2. Boundary Stone Placement",
    desc: "We place boundary stones around your land to clearly mark the property limits and keep your land protected.",
  },
  {
    icon: Camera,
    title: "3. Geo-Tagged Photo & Video Updates",
    desc: "We capture regular geo-tagged photos and videos of your land every 15 days to keep you updated.",
  },
  {
    icon: PaintBucket,
    title: "4. Plot No. Painting",
    desc: "We provide personal plot no. painting to mark and identify your land clearly, preventing confusion and disputes.",
  },
  {
    icon: Sparkles,
    title: "5. Plot Cleaning",
    desc: "We provide plot cleaning services every 2 months to keep your land neat, clean, and well-maintained.",
  },
  {
    icon: ScanLine,
    title: "6. Survey Alignment Verification",
    desc: "Our team confirms that your land boundaries are accurately marked according to government survey records.",
  },
  {
    icon: ShieldCheck,
    title: "7. Encroachment Alerts",
    desc: "LandWalaa notifies you if any unexpected activity is detected near your land, keeping you informed and protected.",
  },
];

export default function LandProtectionPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center gap-2 mb-12">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-black" />
          </Link>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-[#1d2567] rounded-full flex items-center justify-center mb-6 shadow-lg relative">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.5829 13.3332C16.4651 12.4951 17.5694 11.928 18.7646 11.6993C19.9597 11.4706 21.1954 11.59 22.3246 12.0432C22.7407 9.1355 22.6406 6.17721 22.0289 3.3043C21.9624 3.02593 21.7886 2.78509 21.5454 2.63419C21.3022 2.4833 21.0093 2.43455 20.7303 2.49855C18.1199 3.0905 15.386 2.78237 12.9729 1.62424C12.8275 1.55027 12.6667 1.51172 12.5036 1.51172C12.3405 1.51172 12.1796 1.55027 12.0343 1.62424C11.2405 1.99943 10.4104 2.29239 9.55703 2.49855C7.81616 2.89285 6.00914 2.89285 4.26827 2.49855C3.99041 2.43524 3.69879 2.48443 3.45709 2.6354C3.21538 2.78636 3.04323 3.02683 2.97822 3.3043C1.07529 12.6089 4.02826 21.7721 12.5014 23.9236C13.3997 23.6997 14.2707 23.3778 15.0987 22.9636C14.171 21.4439 13.6582 19.7075 13.6115 17.9277C13.6083 17.0677 13.7816 16.2163 14.1207 15.426C14.4598 14.6357 14.9575 13.9234 15.5829 13.3332Z"
                fill="white"
              />
              <path
                d="M23.7426 14.6368C20.7516 11.0544 14.87 13.3147 14.8966 17.9284C14.8965 21.0956 17.1252 23.89 18.4538 25.2786C18.6504 25.4798 18.8854 25.6395 19.1449 25.7483C19.4043 25.8571 19.6829 25.9127 19.9643 25.9119C20.2456 25.9111 20.5239 25.8539 20.7827 25.7436C21.0415 25.6334 21.2756 25.4723 21.4711 25.27C22.2467 24.4634 22.9348 23.577 23.524 22.6257C25.0315 20.3328 25.766 16.9062 23.7426 14.6368ZM19.9582 20.5042C19.2549 20.5029 18.5809 20.223 18.0836 19.7257C17.5864 19.2285 17.3065 18.5544 17.3052 17.8512C17.4316 14.3404 22.4852 14.3413 22.6111 17.8513C22.6098 18.5545 22.3299 19.2285 21.8327 19.7258C21.3354 20.223 20.6614 20.5029 19.9582 20.5042Z"
                fill="white"
              />
              <path
                d="M19.9574 16.4836C19.5975 16.4877 19.2536 16.6335 19.0005 16.8895C18.7474 17.1454 18.6055 17.4909 18.6055 17.8509C18.6055 18.2108 18.7474 18.5563 19.0006 18.8122C19.2537 19.0682 19.5975 19.214 19.9575 19.218C20.3174 19.214 20.6612 19.0682 20.9144 18.8122C21.1675 18.5562 21.3094 18.2108 21.3094 17.8508C21.3094 17.4908 21.1674 17.1454 20.9143 16.8894C20.6612 16.6335 20.3174 16.4877 19.9574 16.4836Z"
                fill="white"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-medium text-black mb-4">
            Land Protection
          </h2>
          <p className="text-xl text-black font-medium leading-relaxed mb-10">
            Keep Your Land Safe & Legally <br /> Protected
          </p>
          <div className="bg-[#E9EBEF] rounded-2xl p-8 mb-6 w-full shadow-sm">
            <p className="text-black text-xl px-10 leading-relaxed">
              Get real-time monitoring, periodic inspections, and boundary
              verification so your land stays secure even when you&apos;re far away.
            </p>
          </div>

          <div className="bg-[#E9EBEF] rounded-2xl p-8 w-full text-left shadow-sm mb-12">
            <h3 className="text-[#000a58] text-xl font-medium mb-8">
              What You Get
            </h3>

            <div className="flex flex-col gap-8">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#1d2567] flex items-center justify-center shrink-0">
                    <Icon className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black text-lg mb-1">
                      {title}
                    </h4>
                    <p className="text-black text-lg">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/land-protection-quote" className="w-full">
            <button className="w-full bg-[#1d2567] text-white font-semibold text-lg py-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity">
              Continue
            </button>
          </Link>
        </div>
      </div>

      <Contact />
      <Footer />
    </main>
  );
}
