import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type TeamMember = {
  name: string;
  title: string;
  photo?: string;
};

const TEAM: TeamMember[] = [
  {
    name: "Padhuri Shekar Reddy",
    title: "Founder - Director",
    photo: "/team/padhuri-shekar-reddy.jpg",
  },
  {
    name: "Peetla Vijay",
    title: "Director",
  },
  {
    name: "Varikuppala Pandu Prasad",
    title: "Director",
  },
];

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white rounded-3xl shadow-xs border border-gray-100 overflow-hidden text-center transition-shadow hover:shadow-lg">
      <div className="relative w-full aspect-4/5 bg-gray-100">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-b from-gray-50 to-gray-100">
            <User className="w-20 h-20 text-gray-300" strokeWidth={1.25} />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#111a61]">{member.name}</h3>
        <p className="text-[#EF9E41] font-semibold mt-1">{member.title}</p>
      </div>
    </div>
  );
}

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Header />

      <div className="bg-gray-50 pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Intro card, matches Terms/Privacy page styling */}
          <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-8 md:p-14 relative overflow-hidden mb-16">
            <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-[#EF9E41] to-[#111a61]"></div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              About Us
            </h1>
            <p className="text-gray-700 leading-relaxed md:text-lg max-w-3xl">
              LANDWALAA PRIVATE LIMITED is your trusted platform for buying
              and selling verified open and agricultural plots. We
              prioritize transparency, legal safety, and customer
              satisfaction in every transaction, helping our customers make
              confident, well-informed land decisions.
            </p>
          </div>

          {/* Leadership team */}
          <h2 className="text-2xl md:text-3xl font-bold text-[#111a61] mb-8 text-center">
            Our Leadership
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
