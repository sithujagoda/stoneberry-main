"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { LockClosedIcon, CheckCircleIcon, PhotoIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface UserProfile {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  mobilenumber: string;
  seller_type: string;
  business_name: string;
  business_registration_number: string;
  address: string;
  province: string;
  city: string;
  profile_image_url: string;
  created_at: string;
  is_complete: boolean;
}

export default function MyDetailsPage() {
  const { data: session, status, update } = useSession();
  
  const [initialData, setInitialData] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    mobilenumber: '',
    business_name: '',
    business_registration_number: '',
    address: '',
    province: '',
    city: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchProfile((session as any).accessToken);
    }
  }, [status, session]);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setInitialData(result.data);
        setFormData({
          firstname: result.data.firstname || '',
          lastname: result.data.lastname || '',
          mobilenumber: result.data.mobilenumber || '',
          business_name: result.data.business_name || '',
          business_registration_number: result.data.business_registration_number || '',
          address: result.data.address || '',
          province: result.data.province || '',
          city: result.data.city || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isDirty = initialData && (
    initialData.firstname !== formData.firstname ||
    initialData.lastname !== formData.lastname ||
    initialData.mobilenumber !== formData.mobilenumber ||
    initialData.business_name !== formData.business_name ||
    initialData.business_registration_number !== formData.business_registration_number ||
    initialData.address !== formData.address ||
    initialData.province !== formData.province ||
    initialData.city !== formData.city
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !session) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const token = (session as any).accessToken;
    const uploadForm = new FormData();
    uploadForm.append('profileImage', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadForm
      });
      const result = await response.json();
      if (result.success) {
        setInitialData(result.data); // Update with new profile image URL
        await update(); // Sync next-auth just in case
      } else {
        alert(result.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || !session) return;
    
    setIsSaving(true);
    setSaveMessage('');

    try {
      const token = (session as any).accessToken;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setInitialData(result.data); // Reset initial data so isDirty becomes false
        await update(); 
        setSaveMessage('Profile updated successfully.');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        alert(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !initialData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl rounded bg-white border border-neutral-200 p-8 shadow-sm">
      <div className="mb-8 border-b border-neutral-200 pb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-black">Personal Information</h3>
          <p className="text-[11px] text-neutral-500 mt-2">Update your personal and contact details securely.</p>
        </div>
        
        {/* Verification Status */}
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">Status</span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#00A859] bg-[#00A859]/10">
            <CheckCircleIcon className="w-3.5 h-3.5" /> Verified
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Profile Picture Section */}
        <div className="flex items-center gap-6 pb-8 border-b border-neutral-100">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm shrink-0">
            {isUploading ? (
               <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                 <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
               </div>
            ) : initialData.profile_image_url ? (
              <Image 
                src={initialData.profile_image_url} 
                alt="Profile" 
                fill 
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="h-full w-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                {initialData.firstname?.[0]?.toUpperCase() || initialData.email[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-[13px] font-extrabold tracking-tight text-black mb-1">Profile Picture</h4>
            <p className="text-[11px] text-neutral-500 mb-3 max-w-sm">We recommend an image of at least 400x400px. JPG or PNG allowed.</p>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/png, image/jpeg" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 rounded border border-neutral-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-neutral-50 transition-colors"
            >
              <PhotoIcon className="w-4 h-4" /> 
              {initialData.profile_image_url ? 'Change Picture' : 'Upload Picture'}
            </button>
          </div>
        </div>

        {/* Read-only Email Field */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2">Email Address</label>
          <div className="relative mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LockClosedIcon className="h-4 w-4 text-neutral-400" aria-hidden="true" />
            </div>
            <input
              type="email"
              disabled
              value={initialData.email}
              className="block w-full rounded border border-neutral-200 bg-neutral-50 py-3 pl-10 text-[12px] text-neutral-500 focus:outline-none cursor-not-allowed"
            />
          </div>
          <p className="mt-2 text-[10px] text-neutral-400">Email address cannot be changed.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstname" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2">First Name</label>
            <input
              type="text"
              name="firstname"
              id="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="block w-full rounded border border-neutral-200 py-3 px-3 text-[12px] text-black focus:border-black focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="lastname" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2">Last Name</label>
            <input
              type="text"
              name="lastname"
              id="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="block w-full rounded border border-neutral-200 py-3 px-3 text-[12px] text-black focus:border-black focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="mobilenumber" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2">Mobile Number</label>
          <input
            type="text"
            name="mobilenumber"
            id="mobilenumber"
            value={formData.mobilenumber}
            onChange={handleChange}
            className="block w-full rounded border border-neutral-200 py-3 px-3 text-[12px] text-black focus:border-black focus:outline-none focus:ring-0 transition-colors"
          />
        </div>
        
        {/* Business Details */}
        <div className="pt-6 mt-8 border-t border-neutral-200">
          <h4 className="text-[13px] font-extrabold tracking-tight text-black mb-6">Business & Location</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="business_name" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2">Business Name (Optional)</label>
            <input
              type="text"
              name="business_name"
              id="business_name"
              value={formData.business_name}
              onChange={handleChange}
              className="block w-full rounded border border-neutral-200 py-3 px-3 text-[12px] text-black focus:border-black focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="business_registration_number" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2">Registration No (Optional)</label>
            <input
              type="text"
              name="business_registration_number"
              id="business_registration_number"
              value={formData.business_registration_number}
              onChange={handleChange}
              className="block w-full rounded border border-neutral-200 py-3 px-3 text-[12px] text-black focus:border-black focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2">Address</label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address}
            onChange={handleChange}
            className="block w-full rounded border border-neutral-200 py-3 px-3 text-[12px] text-black focus:border-black focus:outline-none focus:ring-0 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="city" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              id="city"
              value={formData.city}
              onChange={handleChange}
              className="block w-full rounded border border-neutral-200 py-3 px-3 text-[12px] text-black focus:border-black focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="province" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2">Province</label>
            <input
              type="text"
              name="province"
              id="province"
              value={formData.province}
              onChange={handleChange}
              className="block w-full rounded border border-neutral-200 py-3 px-3 text-[12px] text-black focus:border-black focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-neutral-200 flex items-center justify-between">
          <div>
            {saveMessage && (
              <span className="text-[11px] text-[#00A859] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4" /> {saveMessage}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className={`rounded px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest text-white transition-colors focus:outline-none ${
              isDirty 
                ? 'bg-black hover:bg-neutral-800' 
                : 'bg-neutral-300 cursor-not-allowed'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
