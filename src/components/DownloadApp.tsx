import React from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";

const DownloadApp = () => {
  return (
    <section className="bg-white pt-4 pb-12 md:py-20 px-4 md:px-4 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto bg-[#FFFBF2] rounded-3xl md:rounded-[30px] px-5 py-8 md:py-12 md:px-8 lg:px-12 relative overflow-hidden shadow-sm border border-orange-100">
        {/* Left Content */}
        <div className="relative z-10 max-w-2xl space-y-3 flex-1 pb-6 lg:pb-8">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#050a24] mb-1 leading-tight">
              Download Landwalaa Mobile App
            </h2>
            <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed">
              and discover verified open & agricultural plots near you
            </p>
          </div>

          <ul className="space-y-3">
            {[
              "Find verified open and agricultural plots across prime locations",
              "Explore nearby properties with transparent pricing and details",
              "Access legal verification and land protection services",
              "Save listings and track your favourite plots easily",
            ].map((text, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-[#0066FF]">
                  <Icon icon="mdi:check" className="w-3 h-3" />
                </div>
                <span className="text-gray-700 text-sm leading-relaxed md:leading-loose">
                  {text}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-row flex-wrap gap-3 sm:gap-4 pt-4">
            {/* Google Play Button */}
            <a
              href="#"
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl w-fit"
            >
              <Icon icon="logos:google-play-icon" className="w-6 h-6" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-300">
                  GET IT ON
                </span>
                <span className="text-base font-medium">Google Play</span>
              </div>
            </a>

            {/* App Store Button */}
            <a
              href="#"
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl w-fit"
            >
              <Icon icon="ic:baseline-apple" className="w-7 h-7" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-300">
                  Download on the
                </span>
                <span className="text-base font-medium">App Store</span>
              </div>
            </a>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 lg:right-12 z-10 w-[220px] md:w-[260px] lg:w-[400px] flex justify-end translate-y-[40%]">
          <div className="relative">
            <div className="absolute top-16 -right-4 lg:-right-6 bg-blue-500 text-white p-2.5 rounded-full shadow-lg z-20 animate-bounce cursor-pointer">
              <Icon icon="mdi:bell" className="w-5 h-5" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            </div>

            <Image
              src="/phone.png"
              alt="Landwalaa Mobile App Interface"
              width={400}
              height={800}
              className="w-full h-auto drop-shadow-2xl"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
