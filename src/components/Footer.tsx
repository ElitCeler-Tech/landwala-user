import { Icon } from "@iconify/react";
import Link from "next/link";
import Icons from "../../public/Icons.svg";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#050a24] pt-12 pb-8 md:pt-20 md:pb-10">
      {/* Decorative icons on the left side */}
      <Image
        src={Icons}
        alt=""
        aria-hidden="true"
        className="absolute left-0 top-20 w-32 md:w-40 lg:w-48 opacity-10 transform translate-x-4 md:translate-x-8 pointer-events-none"
      />

      {/* Linear gradient border at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#EF9E41] to-white opacity-80"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-8 mb-10 md:mb-16">
          {/* Section 1: Logo & Description */}
          <div className="space-y-4 md:space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl md:text-4xl font-extrabold tracking-wide text-white">
                Land<span className="text-[#EF9E41]">wala</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Landwala is your trusted platform for buying and selling verified
              open and agricultural plots. We prioritize transparency, legal
              safety, and customer satisfaction in every transaction.
            </p>
          </div>

          {/* Section 2: Quick Links */}
          <div className="lg:pl-12">
            <h3 className="text-[#EF9E41] font-bold text-base md:text-lg mb-4 md:mb-6">
              Quick Links
            </h3>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-6 md:gap-x-8">
              {[
                { name: "Home", href: "/" },
                { name: "Properties", href: "/#properties" },
                { name: "Our Categories", href: "/#categories" },
                { name: "Quick Actions", href: "/#quick-actions" },
                { name: "About Us", href: "/about-us" },
                { name: "Why Choose Us", href: "/why-choose-us" },
                { name: "FAQs", href: "/faqs" },
                { name: "Contact Us", href: "/#contact-us" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-[#EF9E41] text-sm font-medium transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-[#EF9E41] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Social & Address */}
          <div className="lg:pl-8 grid grid-cols-1 gap-8 md:block md:space-y-8">
            {/* Social Media */}
            <div>
              <h3 className="text-[#EF9E41] font-bold text-base md:text-lg mb-4 md:mb-6">
                Connect With Us
              </h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#EF9E41] hover:border-[#EF9E41] hover:-translate-y-1 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Icon icon="mdi:instagram" width="20" height="20" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#EF9E41] hover:border-[#EF9E41] hover:-translate-y-1 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Icon icon="mdi:facebook" width="20" height="20" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#EF9E41] hover:border-[#EF9E41] hover:-translate-y-1 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Icon icon="mdi:linkedin" width="20" height="20" />
                </a>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-[#EF9E41] font-bold text-base md:text-lg mb-3 md:mb-4">
                Office Address
              </h3>
              <div className="flex items-start gap-3 text-gray-400 text-sm leading-relaxed">
                <Icon
                  icon="mdi:map-marker"
                  className="w-5 h-5 shrink-0 text-[#EF9E41] mt-0.5"
                />
                <div>
                  <p className="font-medium text-white mb-1">
                    Landwala Headquarters
                  </p>
                  <p>H.NO: 1-70, New Vasavi Residency,</p>
                  <p>Chaitanyapuri Colony, Saroornagar,</p>
                  <p>K.V Rangareddy - 500060, Telangana</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-center text-xs text-gray-500 font-medium">
          <p>© 2025 LANDWALAA PRIVATE LIMITED | All Rights Reserved</p>
          <div className="flex gap-6">
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
