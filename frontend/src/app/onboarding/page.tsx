"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();

  // Step state
  const [step, setStep] = useState(1);

  // Form states
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [mobilenumber, setMobilenumber] = useState("");
  const [sellerType, setSellerType] = useState("Individual Gem Dealer");
  const [businessName, setBusinessName] = useState("");
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState("");

  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prepopulate names from Google session if available
  useEffect(() => {
    if (session?.user) {
      if (session.user.firstname) setFirstname(session.user.firstname);
      if (session.user.lastname) setLastname(session.user.lastname);
    }
  }, [session]);

  // If session is loading, show minimal loader
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-stoneberry-beige flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Seller Type options
  const sellerTypes = [
    "Individual Gem Dealer",
    "Artisanal Miner",
    "Lapidary / Gem Cutter",
    "Jewelry Manufacturer",
    "Wholesale Exporter",
    "Private Collector"
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstname.trim() || !lastname.trim() || !mobilenumber.trim() || !sellerType) {
      setError("Please fill in all required fields (First Name, Last Name, Mobile Number, and Seller Type).");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleBack = () => {
    setError(null);
    setStep(1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !province.trim() || !city.trim()) {
      setError("Please complete all location fields.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Seller Terms & Conditions to complete your registration.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const accessToken = (session as any)?.accessToken;
      if (!accessToken) {
        setError("Your session has expired. Please sign in again.");
        setLoading(false);
        return;
      }

      // 1. Submit details to FastAPI Backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/onboarding`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          firstname,
          lastname,
          mobilenumber,
          seller_type: sellerType,
          business_name: businessName || null,
          business_registration_number: businessRegistrationNumber || null,
          address,
          province,
          city
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to update onboarding profile.");
        setLoading(false);
        return;
      }

      // 2. Update NextAuth session cookie in browser
      await update({
        is_complete: true,
        firstname,
        lastname
      });

      // 3. Redirect to marketplace home
      router.push("/");
      router.refresh();

    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-stoneberry-beige flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-[800px] rounded-[32px] p-8 lg:p-14 shadow-sm border border-neutral-100">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-wide text-black mb-3">
          Your Profile
        </h1>
        <p className="text-[13px] text-neutral-700 font-medium mb-8 leading-relaxed">
          <span className="text-[#A98467] font-semibold italic">Note:</span> To continue, please complete your profile and verification details to unlock full access to the Stoneberry marketplace.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your First Name"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="w-full px-4 py-3.5 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-colors bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Last Name"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="w-full px-4 py-3.5 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-colors bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                placeholder="Your Mobile Number"
                value={mobilenumber}
                onChange={(e) => setMobilenumber(e.target.value)}
                className="w-full px-4 py-3.5 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Seller Type
              </label>
              <select
                value={sellerType}
                onChange={(e) => setSellerType(e.target.value)}
                className="w-full px-4 py-3.5 border border-neutral-200 rounded-lg text-sm text-neutral-600 focus:outline-none focus:border-black transition-colors bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.25rem',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {sellerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Business Name (optional)
              </label>
              <input
                type="text"
                placeholder="Your Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3.5 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Business Registration Number (optional)
              </label>
              <input
                type="text"
                placeholder="Your Business Registration Number"
                value={businessRegistrationNumber}
                onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                className="w-full px-4 py-3.5 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-colors bg-white"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-black text-white hover:bg-neutral-800 transition-colors font-medium text-[15px] rounded-lg flex items-center gap-2"
              >
                Next &rarr;
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Address / Business Address
              </label>
              <input
                type="text"
                required
                placeholder="Your Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3.5 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Province
              </label>
              <input
                type="text"
                required
                placeholder="Your Province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-4 py-3.5 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                City
              </label>
              <input
                type="text"
                required
                placeholder="Your City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3.5 border border-neutral-200 rounded-lg text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black transition-colors bg-white"
              />
            </div>

            <div className="flex items-start gap-3 py-2">
              <div className="flex items-center h-5">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 border border-neutral-300 rounded focus:ring-0 focus:outline-none accent-black cursor-pointer bg-white"
                />
              </div>
              <label htmlFor="agreeTerms" className="text-sm text-neutral-600 font-medium select-none cursor-pointer">
                I have read and agree to the{" "}
                <span className="text-[#A98467] font-semibold italic hover:underline">
                  Seller Terms & Conditions
                </span>
              </label>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-8 py-3 bg-white border border-neutral-300 text-black hover:bg-neutral-50 transition-colors font-medium text-[15px] rounded-lg"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-black text-white hover:bg-neutral-800 transition-colors font-medium text-[15px] rounded-lg disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
