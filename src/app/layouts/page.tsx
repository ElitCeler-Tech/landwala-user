"use client";

import Header from "@/components/Header";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
    ArrowLeft,
    Map,
    CheckCircle,
    LayoutTemplate,
    ShieldCheck,
    TreePine,
} from "lucide-react";

export default function LayoutsLandingPage() {
    return (
        <main className="min-h-screen bg-white font-sans text-gray-900">
            <Header />

            <div className="max-w-2xl mx-auto px-4 md:px-6 pt-22 md:pt-28 pb-12 md:pb-32">
                <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-12">
                    <Link
                        href="/"
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-7 h-7 md:w-8 md:h-8 text-black" />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-medium text-black">Layouts</h1>
                </div>

                <div className="flex flex-col items-center text-center">
                    {/* Main Icon */}
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-[#0a1045] rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-lg relative">
                        <svg
                            width="60"
                            height="60"
                            className="w-10 h-10 md:w-[60px] md:h-[60px]"
                            viewBox="0 0 68 68"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clipPath="url(#clip0_645_132368_landing)">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M13.9709 33.2785H24.2155C26.1906 36.7611 28.7061 40.0145 31.2187 42.8503C31.2681 42.9095 31.3216 42.9653 31.3787 43.0172C32.0651 43.6419 33.1324 43.592 33.7578 42.9062C36.2534 40.1703 38.895 36.8664 40.9706 33.2785H51.2461C51.3825 33.2785 51.5001 33.3595 51.553 33.4762L51.581 33.5282C50.8208 33.9904 50.1116 34.5456 49.4699 35.1873C47.3592 37.2981 46.1827 40.1377 46.1827 43.1234C46.1827 46.1089 47.3592 48.9487 49.4699 51.0594C51.5806 53.1701 54.4203 54.3466 57.4058 54.3466C59.0885 54.3466 60.7248 53.9727 62.2106 53.2687L64.641 57.7821C64.7289 57.9457 64.6676 58.1497 64.504 58.2377C64.4533 58.265 64.3986 58.2779 64.3447 58.2778V58.2785H0.872194C0.686128 58.2785 0.535156 58.1275 0.535156 57.9414C0.535156 57.8757 0.553962 57.8146 0.586407 57.7628L13.6746 33.4563C13.7353 33.3435 13.8511 33.2793 13.9709 33.2793V33.2785ZM57.4057 33.2485C54.6789 33.2485 52.2102 34.3538 50.4231 36.1408C48.6361 37.9279 47.5308 40.3965 47.5308 43.1234C47.5308 45.8502 48.6361 48.319 50.4231 50.1059C52.2102 51.8929 54.6789 52.9982 57.4057 52.9982C60.1325 52.9982 62.6013 51.8929 64.3883 50.1059C66.1753 48.3188 67.2806 45.8502 67.2806 43.1234C67.2806 40.3965 66.1753 37.9279 64.3883 36.1408C62.6013 34.3538 60.1325 33.2485 57.4057 33.2485ZM51.613 43.5777L55.1719 47.1366C55.5404 47.5052 56.1379 47.5052 56.5065 47.1366L63.1984 40.4447C63.5669 40.0762 63.5669 39.4786 63.1984 39.1101C62.8298 38.7415 62.2323 38.7415 61.8637 39.1101L60.6058 40.368L55.8392 45.1346L53.3105 42.606L52.9475 42.2431C52.579 41.8746 51.9814 41.8746 51.6129 42.2431C51.2445 42.6116 51.2445 43.2091 51.613 43.5777ZM32.2463 41.9768C32.258 41.9921 32.2713 42.0066 32.2861 42.02C32.4234 42.145 32.6364 42.1349 32.7614 41.9976C40.4838 33.5315 43.3983 26.4684 43.4682 21.1234C43.4933 19.2056 43.1542 17.5079 42.54 16.044C41.923 14.5734 41.0284 13.3375 39.9462 12.3505C37.9558 10.5348 35.3315 9.56648 32.6341 9.53126C30.7012 9.50596 28.8034 9.96947 27.1475 10.8913C25.0959 12.0335 23.4163 13.877 22.4998 16.3637C21.5902 18.8318 21.4344 21.9313 22.4192 25.6021C23.6504 30.1917 26.6712 35.689 32.2463 41.9768ZM35.5243 17.2222C36.2706 17.9685 36.7322 18.9994 36.7322 20.1382C36.7322 21.277 36.2706 22.3081 35.5243 23.0542C34.7781 23.8005 33.7471 24.262 32.6083 24.262C31.4695 24.262 30.4384 23.8005 29.6923 23.0542C28.9461 22.308 28.4845 21.277 28.4845 20.1382C28.4845 18.9994 28.9461 17.9683 29.6923 17.2222C30.4386 16.476 31.4695 16.0144 32.6083 16.0144C33.7471 16.0144 34.7782 16.476 35.5243 17.2222Z"
                                    fill="white"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_645_132368_landing">
                                    <rect width="67.8049" height="67.8049" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-medium text-black mb-2 md:mb-4">Layouts</h2>
                    <p className="text-base md:text-lg text-black font-medium leading-relaxed mb-6 md:mb-10">
                        Find RERA-Approved & <br /> Builder-Verified Layouts
                    </p>

                    <div className="bg-[#E9EBEF] rounded-2xl p-5 md:p-8 mb-4 md:mb-6 w-full shadow-sm text-center">
                        <p className="text-black text-[15px] md:text-lg leading-relaxed">
                            Browse curated layouts with clear boundaries, verified approvals,
                            and accurate mapping — so you invest with confidence.
                        </p>
                    </div>

                    <div className="bg-[#E9EBEF] rounded-2xl p-5 md:p-8 w-full text-left shadow-sm mb-8 md:mb-12">
                        <h3 className="text-[#1d2567] text-lg md:text-xl font-bold mb-5 md:mb-8">
                            What You Get
                        </h3>

                        <div className="flex flex-col gap-5 md:gap-8">
                            {/* Item 1 */}
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1d2567] flex items-center justify-center shrink-0">
                                    <Map className="text-white w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-black text-base md:text-lg mb-1">
                                        1. Verified Maps
                                    </h4>
                                    <ul className="text-black text-[15px] md:text-lg list-disc pl-5 space-y-1 marker:text-black">
                                        <li>Accurate plot boundaries</li>
                                        <li>Latest masterplan alignment</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Item 2 */}
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1d2567] flex items-center justify-center shrink-0">
                                    <ShieldCheck className="text-white w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-black text-base md:text-lg mb-1">
                                        2. Approvals Check
                                    </h4>
                                    <ul className="text-black text-[15px] md:text-lg list-disc pl-5 space-y-1 marker:text-black">
                                        <li>RERA / DTCP / HMDA approvals</li>
                                        <li>Builder verification status</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Item 3 */}
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1d2567] flex items-center justify-center shrink-0">
                                    <LayoutTemplate className="text-white w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-black text-base md:text-lg mb-1">
                                        3. Amenities Overview
                                    </h4>
                                    <ul className="text-black text-[15px] md:text-lg list-disc pl-5 space-y-1 marker:text-black">
                                        <li>Road widths, parks, facilities</li>
                                        <li>Nearby infrastructure map</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link href="/layouts/explore" className="w-full">
                        <button className="w-full bg-[#1d2567] hover:bg-[#151b4d] text-white font-semibold text-base md:text-lg py-3.5 md:py-4 rounded-xl shadow-lg transition-colors cursor-pointer">
                            Explore Layouts
                        </button>
                    </Link>
                </div>
            </div>

            <Contact />
            <Footer />
        </main>
    );
}
