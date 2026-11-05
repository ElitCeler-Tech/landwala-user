"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Icon } from "@iconify/react";

// Assets
const Vector14 = "/contact/Vector 14.svg";
const resort = "/resort.png";
const chines = "/chinese-city 1.png";
const video = "/about.mp4";

function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <div className="flex flex-col">
      <section
        ref={containerRef}
        className="relative min-h-[600px] bg-[#050a24] flex items-start px-6 sm:px-8 overflow-hidden py-20"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <svg
            className="absolute left-0 top-0 h-full w-full pointer-events-none z-0"
            viewBox="0 0 1440 800"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-100 750 C 500 800 900 500 500 -200"
              stroke="#EF9E41"
              strokeOpacity="0.3"
              strokeWidth="4"
            />
          </svg>
          <div className="absolute bottom-10 left-4 sm:bottom-20 sm:left-10 z-0">
            {/* Dot 1 */}
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-[#EF9E41] rounded-full"></div>
            {/* Star 1 */}
            <svg
              className="absolute bottom-12 left-8 w-3 h-3 text-[#EF9E41]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0L15 9L24 12L15 15L12 24L9 15L0 12L9 9L12 0Z" />
            </svg>
            {/* Cross 1 */}
            <div className="absolute bottom-24 left-0 text-[#EF9E41] text-lg leading-none font-light">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 0V12M0 6H12" stroke="#EF9E41" strokeWidth="1.5" />
              </svg>
            </div>
            {/* Dot 2 */}
            <div className="absolute bottom-32 left-12 w-1 h-1 bg-[#EF9E41] rounded-full opacity-80"></div>
            {/* Cross 2 */}
            <div className="absolute -bottom-4 left-24 text-[#EF9E41]">
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 0V12M0 6H12" stroke="#EF9E41" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pt-4">
          <div className="grid">
            <div className="relative">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="text-white mb-6 leading-tight font-extrabold text-3xl sm:text-4xl lg:text-6xl"
              >
                <span className="relative inline-block">
                  <span className="relative z-10">Helping you find</span>
                  <motion.img
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.8, ease: "backOut", delay: 0.6 }}
                    src={Vector14}
                    alt=""
                    aria-hidden="true"
                    className="absolute -bottom-3 md:-bottom-4 left-0 w-32 sm:w-40 md:w-52 z-0 origin-left"
                  />
                </span>
                <br />
                the property of
                <br />
                your <span className="text-[#EF9E41]">dreams.</span>
              </motion.h1>
            </div>
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
                className="text-base sm:text-lg text-white mb-8 leading-relaxed"
              >
                Creating quality urban lifestyles, <br />
                building stronger communities.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg min-w-[180px]">
                  <Icon icon="logos:google-play-icon" width="30" height="30" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                      Get it on
                    </span>
                    <span className="text-xl font-bold">Google Play</span>
                  </div>
                </button>
                <button className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg min-w-[180px]">
                  <Icon icon="logos:apple" width="30" height="30" />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                      Download on the
                    </span>
                    <span className="text-xl font-bold">App Store</span>
                  </div>
                </button>
              </motion.div>
            </div>
          </div>

          <div className="relative pt-4 sm:pt-10">
            <div className="relative h-80 sm:h-96 lg:h-[500px]">
              {/* Background Image - Urban Properties (Top, Larger) */}
              <motion.div
                style={{ y: y1 }}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-44 sm:static sm:translate-x-0 sm:top-0 sm:-right-4 sm:w-[34rem] sm:h-72 lg:h-80 rounded-3xl overflow-hidden shadow-2xl z-0 border-4 border-white"
              >
                <div className="w-full h-full relative">
                  <Image
                    src={chines}
                    alt="City View"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </motion.div>
              {/* Foreground Image - Resort Properties (Bottom, Smaller) */}
              <motion.div
                style={{ y: y2 }}
                initial={{ opacity: 0, x: -50, y: 50 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
                className="absolute bottom-2 left-6 w-60 h-36 sm:bottom-10 sm:-left-32 sm:w-72 lg:w-80 sm:h-56 lg:h-64 rounded-3xl overflow-hidden shadow-2xl z-10 border-4 border-white"
              >
                <div className="w-full h-full relative">
                  <Image
                    src={resort}
                    alt="Resort View"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      {/* Video Section */}
      <section className="bg-black w-full aspect-video md:aspect-auto md:h-screen relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full h-full"
        >
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            src={video}
          >
            Your browser does not support the video tag.
          </video>
        </motion.div>
      </section>
    </div>
  );
}

export default Hero;
