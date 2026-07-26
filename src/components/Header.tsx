"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { UserCircle, Heart, Menu, X, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sections = useMemo(
    () => [
      { id: "home", label: "Home", href: "/" },
      { id: "categories", label: "Categories", href: "/#categories" },
      { id: "properties", label: "Properties", href: "/#properties" },
      { id: "quick-actions", label: "Quick Actions", href: "/#quick-actions" },
      { id: "contact-us", label: "Contact us", href: "/#contact-us" },
    ],
    [],
  );

  const scrollToSection = (sectionId: string) => {
    if (pathname !== "/" && sectionId !== "home") return;

    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 100; 
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    } else if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    if (pathname === "/") {
      e.preventDefault();
      scrollToSection(sectionId);
      setActiveSection(sectionId);
      setMobileOpen(false);
      // Update URL hash without jumping
      if (sectionId !== "home") {
        window.history.pushState(null, "", `/#${sectionId}`);
      } else {
        window.history.pushState(null, "", "/");
      }
    } else {
      setMobileOpen(false);
    }
  };

  // Scroll spy to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // Offset

      // Default to home if at top
      if (window.scrollY < 100) {
        setActiveSection("home");
        return;
      }

      for (const section of sections) {
        if (section.id === "home") continue;
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-r from-blue-200 via-blue-50 to-white px-6 sm:px-8 py-3 flex justify-between items-center fixed top-4 left-4 right-4 z-50 rounded-full shadow-lg max-w-[1400px] mx-auto"
      >
        {/* Logo Section */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, "home")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-300 focus:outline-none"
        >
          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            <Image
              src="/logo.png"
              alt="LandWalaa Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-xl sm:text-2xl font-bold -ml-1">
            <span className="text-[#1d2567]">Land</span>
            <span className="text-[#f7ae49]">Walaa</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-6 xl:gap-8">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              onClick={(e) => handleNavClick(e, section.id)}
              className={`font-medium text-base transition-all duration-300 relative ${
                activeSection === section.id
                  ? "text-[#f7ae49]"
                  : "text-[#1d2567] hover:text-[#f7ae49]"
              }`}
            >
              {section.label}
              {activeSection === section.id && (
                <motion.div
                  layoutId="activeSection"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#f7ae49]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Action Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          {mounted && isAuthenticated ? (
            <>
              <Link
                href="/notifications"
                className="text-[#1d2567] hover:text-[#f7ae49] transition-colors p-2"
              >
                <Bell className="w-6 h-6" />
              </Link>

              <Link
                href="/wishlist"
                className="text-[#1d2567] hover:text-[#f7ae49] transition-colors p-2"
              >
                <Heart className="w-6 h-6" />
              </Link>

              <Link
                href="/profile"
                className="text-[#1d2567] hover:text-[#f7ae49] transition-colors p-2"
              >
                <UserCircle className="w-7 h-7" />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="bg-transparent border-none text-[#1d2567] font-medium text-base px-3 py-2 hover:text-[#f7ae49] transition-colors duration-300"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-white border text-[#1d2567] border-[#1d2567] font-medium text-base px-5 py-2 rounded-lg hover:bg-[#1d2567] hover:text-white transition-all duration-300"
              >
                Sign Up Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-4 lg:hidden">
          {mounted && isAuthenticated && (
            <>
              <Link
                href="/notifications"
                className="text-[#1d2567] hover:text-[#f7ae49] transition-colors"
              >
                <Bell className="w-6 h-6" />
              </Link>
              <Link
                href="/profile"
                className="text-[#1d2567] hover:text-[#f7ae49] transition-colors"
              >
                <UserCircle className="w-7 h-7" />
              </Link>
            </>
          )}
          <button
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#1d2567]/20 text-[#1d2567] hover:bg-[#1d2567] hover:text-white transition-colors"
            aria-label="Open menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.header>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white/95 backdrop-blur-md border border-[#1d2567]/10 px-6 py-6 fixed top-24 left-4 right-4 z-40 rounded-2xl shadow-xl"
          >
            <div className="flex flex-col gap-4">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={section.href}
                  onClick={(e) => handleNavClick(e, section.id)}
                  className={`py-2 text-base font-medium rounded-lg px-2 transition-colors ${
                    activeSection === section.id
                      ? "text-[#f7ae49] bg-gray-50"
                      : "text-[#1d2567] hover:text-[#f7ae49]"
                  }`}
                >
                  {section.label}
                </Link>
              ))}

              {mounted && !isAuthenticated && (
                <div className="flex gap-3 pt-4 mt-2 border-t border-gray-100">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 bg-transparent border border-[#1d2567] text-[#1d2567] font-medium text-base px-4 py-2.5 rounded-lg hover:bg-[#1d2567] hover:text-white transition-colors text-center"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 bg-[#1d2567] text-white font-medium text-base px-4 py-2.5 rounded-lg hover:bg-[#2e3675] transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {mounted && isAuthenticated && (
                <>
                  <Link
                    href="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-2 text-base font-medium text-[#1d2567] hover:text-[#f7ae49]"
                  >
                    <Bell className="w-5 h-5" />
                    Notifications
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-2 text-base font-medium text-[#1d2567] hover:text-[#f7ae49]"
                  >
                    <Heart className="w-5 h-5" />
                    My Wishlist
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
