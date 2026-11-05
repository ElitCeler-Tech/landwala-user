"use client";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { contactUsApi, ContactUsData } from "@/lib/api";
import Image from "next/image";

const Blob = "/contact/Blob.png";
const ContactPicture = "/contact/Picture.png";
const Vector14 = "/contact/Vector 14.svg";
const Icons = "/contact/Icons.svg";

function Contact({ id }: { id?: string }) {
  const [formData, setFormData] = useState<ContactUsData>({
    title: "",
    description: "",
    phone: "",
    location: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await contactUsApi.submit(formData);
      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        phone: "",
        location: "",
        email: "",
      });
    } catch (err) {
      console.error("Contact form error:", err);
      setError("Failed to submit enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={id} className="py-12 md:py-24 px-4 sm:px-8 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6 md:mb-8">
            <span className="relative inline-block align-baseline">
              <span className="relative z-10">Connect</span>
              <Image
                src={Vector14}
                alt=""
                width={208}
                height={20}
                aria-hidden="true"
                className="absolute -bottom-2 md:-bottom-6 left-0 w-32 md:w-52 z-0"
              />
            </span>{" "}
            With <span className="text-black">Us</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base mb-6 md:mb-8 leading-relaxed">
            Stay updated with the latest verified land listings, investment
            opportunities, and expert insights from LandWalaa.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            {success && (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                Thank you! Your enquiry has been submitted successfully.
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <input
              type="text"
              name="title"
              placeholder="Title (e.g., Enquiry about plots)"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 md:px-5 py-3 rounded-lg border border-gray-200 focus:border-[#EF9E41] outline-none transition-colors"
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 md:px-5 py-3 rounded-lg border border-gray-200 focus:border-[#EF9E41] outline-none transition-colors"
            />

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 md:px-5 py-3 rounded-lg border border-gray-200 focus:border-[#EF9E41] outline-none transition-colors"
              />
              <input
                type="text"
                name="location"
                placeholder="Current Location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 md:px-5 py-3 rounded-lg border border-gray-200 focus:border-[#EF9E41] outline-none transition-colors"
              />
            </div>

            <textarea
              name="description"
              placeholder="Description (e.g., I am interested in residential plots...)"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 md:px-5 py-3 rounded-lg border border-gray-200 focus:border-[#EF9E41] outline-none transition-colors resize-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1d2567] hover:bg-[#151b4d] text-white font-bold py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Enquiry"
              )}
            </button>
          </form>
        </div>

        <div className="hidden lg:block relative">
          <div className="relative rounded-3xl p-8 -m-8 flex justify-center items-center">
            <Image
              src={Blob}
              alt=""
              width={500}
              height={500}
              aria-hidden="true"
              className="absolute inset-0 m-auto w-[320px] md:w-[420px] lg:w-[500px] h-auto object-contain pointer-events-none select-none z-0"
            />
            {/* Keeping the image structure as requested but ensuring it fits nicely */}
            <div className="relative z-10 w-full h-[500px]">
              <Image
                src={ContactPicture}
                alt="Contact Person"
                fill
                className="object-contain"
              />
            </div>
            <Image
              src={Icons}
              alt=""
              width={160}
              height={160}
              aria-hidden="true"
              className="absolute bottom-10 right-10 w-24 opacity-60 z-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
