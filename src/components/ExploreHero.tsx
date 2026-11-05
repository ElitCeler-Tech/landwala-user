"use client";

import { Search, MapPin, SlidersHorizontal, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function ExploreHero() {
  return (
    <section className="relative w-full pt-28 pb-12 md:pt-0 md:pb-0 md:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/explore/explore-hero.png"
          alt="Explore Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
        {/* Top Icon */}
        <div className="w-14 h-14 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 md:mb-6 border border-white/30">
          <svg
            width="40"
            height="40"
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5428 52.0738H24.8961V62.3807H12.5428V52.0738ZM35.5175 62.3807V45.7033H26.5361V62.3807H35.5175ZM59.3865 64.0206H2.41797C2.22269 64.0206 2.0354 64.0982 1.89731 64.2363C1.75922 64.3744 1.68164 64.5616 1.68164 64.7569C1.68164 64.9522 1.75922 65.1395 1.89731 65.2776C2.0354 65.4157 2.22269 65.4933 2.41797 65.4933H59.3871C59.5824 65.4933 59.7697 65.4157 59.9078 65.2776C60.0458 65.1395 60.1234 64.9522 60.1234 64.7569C60.1234 64.5616 60.0458 64.3744 59.9078 64.2363C59.7697 64.0982 59.5824 64.0206 59.3871 64.0206H59.3865ZM37.1574 62.3807H49.5116V52.0738H37.1574V62.3807ZM68.2103 12.6344L64.021 4.82226C63.9388 4.66958 63.7995 4.55572 63.6335 4.50561C63.4675 4.45551 63.2884 4.47325 63.1354 4.55495L62.4008 4.94894C62.248 5.03113 62.1342 5.17052 62.084 5.33655C62.0339 5.50258 62.0517 5.6817 62.1334 5.83465L66.3228 13.6466C66.3634 13.7223 66.4185 13.7893 66.4849 13.8437C66.5514 13.8981 66.6279 13.9389 66.7102 13.9637C66.7924 13.9885 66.8787 13.9969 66.9641 13.9884C67.0496 13.9798 67.1326 13.9546 67.2082 13.914L67.9432 13.5198C68.0959 13.4376 68.2097 13.2983 68.2597 13.1323C68.3098 12.9663 68.292 12.7873 68.2103 12.6344ZM52.7512 5.46566C46.5556 3.07408 39.9651 8.04351 36.2039 13.0247C35.1419 14.4311 35.1073 15.5308 35.3241 15.7813C35.404 15.8736 35.7688 15.8889 36.4092 15.5374C37.5767 14.8964 38.7395 14.0949 39.8643 13.3199C40.8645 12.6304 41.8185 11.9743 42.7771 11.4189C42.7862 10.6226 43.4104 9.61567 44.2512 9.05467C46.4997 7.55399 52.6748 9.37105 53.8899 9.75055C54.093 9.81895 54.2612 9.96414 54.3586 10.1551C54.456 10.346 54.4748 10.5674 54.4109 10.772C54.3471 10.9766 54.2056 11.148 54.0169 11.2496C53.8282 11.3512 53.6072 11.3749 53.4013 11.3156C50.6892 10.4697 46.3401 9.63193 45.1616 10.4183C44.8564 10.6312 44.6154 10.9235 44.4646 11.2637C48.9316 13.8571 56.408 15.4582 57.8645 15.7537L64.0934 12.9584L61.0459 7.27725C59.5973 7.48388 57.5849 7.33137 52.7512 5.46566ZM49.5116 37.4119L31.0329 22.6945L12.5428 37.6141V50.4338H24.8961V44.8833C24.8961 44.6658 24.9825 44.4573 25.1363 44.3035C25.29 44.1497 25.4986 44.0633 25.7161 44.0633H36.3374C36.5549 44.0633 36.7635 44.1497 36.9172 44.3035C37.071 44.4573 37.1574 44.6658 37.1574 44.8833V50.4338H49.5116V37.4119ZM8.03368 38.3002C8.08698 38.3674 8.153 38.4234 8.22798 38.4651C8.30295 38.5067 8.38541 38.5332 8.47062 38.5429C8.55583 38.5527 8.64213 38.5455 8.72458 38.5219C8.80702 38.4982 8.884 38.4585 8.95109 38.4051L30.5147 21.0049C30.6598 20.8878 30.8405 20.8237 31.027 20.8231C31.2135 20.8226 31.3946 20.8856 31.5405 21.0018L52.854 37.9783C52.9895 38.0833 53.161 38.1307 53.3312 38.1102C53.5015 38.0897 53.6568 38.0031 53.7637 37.869C53.8705 37.7349 53.9203 37.5641 53.9022 37.3936C53.8841 37.2231 53.7996 37.0666 53.667 36.9579L31.0326 18.9293L8.14164 37.3818C8.00551 37.4893 7.91762 37.6465 7.89728 37.8187C7.87693 37.991 7.9258 38.1643 8.03313 38.3006L8.03368 38.3002ZM44.8613 26.0751C45.2062 25.8957 45.4865 25.6129 45.6629 25.2665C45.8393 24.92 45.9031 24.527 45.8453 24.1425C45.6642 23.1379 44.6227 22.4333 42.9881 22.2096C41.4724 22.0021 40.3586 21.1738 39.9321 19.9371C39.7447 19.383 39.7132 18.7882 39.8409 18.2175C39.9686 17.6467 40.2507 17.1221 40.6564 16.7008C41.2159 16.1424 41.9297 15.7643 42.7059 15.615V14.8833C42.7059 14.6658 42.7923 14.4573 42.946 14.3035C43.0998 14.1497 43.3084 14.0633 43.5258 14.0633C43.7433 14.0633 43.9519 14.1497 44.1057 14.3035C44.2594 14.4573 44.3458 14.6658 44.3458 14.8833V15.5931C45.362 15.7719 46.2783 16.3147 46.9231 17.1202C46.991 17.2038 47.0417 17.2999 47.0725 17.4031C47.1032 17.5063 47.1133 17.6146 47.1021 17.7217C47.091 17.8288 47.0589 17.9327 47.0077 18.0274C46.9564 18.1221 46.887 18.2057 46.8034 18.2736C46.7198 18.3415 46.6237 18.3922 46.5205 18.4229C46.4173 18.4537 46.309 18.4637 46.2019 18.4526C46.0948 18.4415 45.9909 18.4094 45.8962 18.3582C45.8015 18.3069 45.7179 18.2375 45.65 18.1539C45.4156 17.8601 45.1209 17.62 44.7857 17.45C44.4506 17.2799 44.0828 17.1838 43.7073 17.1681C42.9884 17.1358 42.2694 17.3949 41.834 17.8433C41.6382 18.046 41.5019 18.2987 41.4401 18.5737C41.3782 18.8487 41.3931 19.1354 41.4832 19.4024C41.7039 20.0426 42.3175 20.4625 43.2111 20.5848C45.5609 20.9065 47.1492 22.1276 47.4599 23.851C47.5836 24.5767 47.4737 25.3229 47.1462 25.9821C46.8187 26.6414 46.2904 27.1796 45.6374 27.5195C45.3894 27.6521 45.1298 27.7615 44.8617 27.8465L48.0034 30.3489C49.2713 29.685 50.3755 28.7472 51.2361 27.6037C52.0967 26.4601 52.6921 25.1394 52.9791 23.7373C53.2661 22.3352 53.2375 20.8868 52.8954 19.497C52.5533 18.1073 51.9063 16.8112 51.0012 15.7025C48.555 14.9515 45.8798 13.9614 43.7552 12.7473C42.801 13.2882 41.8229 13.9621 40.7949 14.6705C39.6367 15.4688 38.4387 16.2942 37.1984 16.9752C36.5202 17.3474 35.9628 17.4797 35.5134 17.4797C35.3185 17.4807 35.1244 17.4534 34.9373 17.3988C34.6182 18.0196 34.368 18.6735 34.1913 19.3487L43.0606 26.4132C43.6812 26.4839 44.3087 26.3661 44.8613 26.0751Z"
              fill="white"
            />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl text-white font-bold mb-2">Explore Plots</h1>
        <p className="text-white text-base md:text-lg text-center mb-6 md:mb-8">
          Discover Curated Plots Across Prime Locations
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl bg-white rounded-lg flex items-center px-4 py-3 md:px-6 md:py-4 mb-4 md:mb-6 shadow-xl">
          <MapPin className="text-[#1d2567] w-6 h-6 mr-3" />
          <input
            type="text"
            placeholder="Near Gayatri Mandir, Noida, Sector 34..."
            className="flex-1 min-w-0 outline-none text-gray-700 text-base md:text-lg placeholder:text-gray-400"
          />
          <Search className="text-gray-400 w-6 h-6 ml-3" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
          <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20 hover:bg-white/20 transition-colors">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M3 21H21M5 21V7H9V21M11 21V3H15V21M17 21V11H21V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium">Plot size</span>
            <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </button>

          <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20 hover:bg-white/20 transition-colors">
            <span className="text-white font-serif italic text-sm">₹</span>
            <span className="text-sm font-medium">Min - Max range</span>
            <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </button>

          <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20 hover:bg-white/20 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Category</span>
            <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </button>
        </div>

        <Link href="/list-property">
          <button className="bg-[#1D2567] hover:bg-[#1f2455] text-white px-10 py-3 rounded-lg font-medium shadow-lg transition-colors border border-white/10">
            List your Property
          </button>
        </Link>
      </div>
    </section>
  );
}
