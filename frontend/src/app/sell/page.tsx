"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Upload, Sun, Camera, Check, X, Video, Image as ImageIcon, Loader2 } from "lucide-react";
import ShapeSelector from "@/components/ShapeSelector";
import IntensitySelector from "@/components/IntensitySelector";

// Shared components for styling the form
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[13px] font-bold text-neutral-800 mb-3">{children}</label>
);

const Select = ({ value, onChange, options, placeholder, error }: { value?: string, onChange?: (val: string) => void, options: string[], placeholder: string, error?: string }) => (
  <div>
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full rounded-lg border bg-white px-5 py-3.5 text-[13px] font-semibold text-neutral-600 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_1.2rem_center] ${error ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-black'
        }`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {error && <p className="text-red-500 text-[10px] font-semibold mt-1.5">{error}</p>}
  </div>
);

const ErrorText = ({ error }: { error?: string }) => (
  error ? <p className="text-red-500 text-[10px] font-semibold mt-1.5">{error}</p> : null
);

const Dropzone = ({
  icon,
  title,
  subtitle,
  label,
  onFileSelect,
  selectedFile,
  error,
  verifyImage = false
}: {
  icon: React.ReactNode,
  title: React.ReactNode,
  subtitle: string,
  label: string,
  onFileSelect: (f: File | null) => void,
  selectedFile: File | null,
  error?: string,
  verifyImage?: boolean
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isImage = selectedFile && selectedFile.type.startsWith('image/');
  const previewUrl = selectedFile && isImage ? URL.createObjectURL(selectedFile) : null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLocalError(null);

      // Instantly clear the old image from the UI
      onFileSelect(null);

      if (verifyImage && file.type.startsWith('image/')) {
        setIsVerifying(true);
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/gems/validate-image`, {
            method: "POST",
            body: fd
          });

          if (res.ok) {
            const data = await res.json();
            if (!data.is_gemstone) {
              setLocalError("AI Verification Failed: This does not appear to be a gemstone.");
              setIsVerifying(false);
              if (fileInputRef.current) fileInputRef.current.value = "";
              return;
            }
          }
        } catch (err) {
          console.error("AI Validation error", err);
          // Proceed normally on backend failure to avoid blocking user
        }
        setIsVerifying(false);
      }

      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">{label}</div>
      <div
        onClick={() => { if (!isVerifying) fileInputRef.current?.click(); }}
        className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${isVerifying ? 'opacity-70 cursor-not-allowed border-neutral-300' : 'cursor-pointer'} ${(error || localError) ? 'border-red-400 bg-red-50/30' : selectedFile ? 'border-[#B87A5B] bg-[#B87A5B]/5' : 'border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400'
          }`}
      >
        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
        />
        {isVerifying ? (
          <div className="flex flex-col items-center py-4">
            <Loader2 className="w-8 h-8 text-[#B87A5B] animate-spin mb-3" />
            <p className="text-[12px] font-bold text-[#B87A5B]">AI is verifying image...</p>
            <p className="text-[10px] text-neutral-400 mt-1">Please wait a moment</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center animate-in zoom-in duration-300 w-full">
            {(error || localError) && <p className="text-red-500 text-[10px] font-bold mb-2">{localError || error}</p>}
            {previewUrl && (
              <div className="w-full max-w-[200px] aspect-square rounded-lg overflow-hidden mb-3 border border-neutral-200 shadow-sm">
                <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-[#B87A5B]/10 flex items-center justify-center">
                <Check className="w-3 h-3 text-[#B87A5B]" />
              </div>
              <p className="text-[12px] font-bold text-[#B87A5B]">{selectedFile.name}</p>
            </div>
            <p className="text-[10px] font-medium text-neutral-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p className="text-[10px] font-medium text-neutral-400 mt-1">Click to replace</p>
          </div>
        ) : (
          <>
            {(error || localError) && <p className="text-red-500 text-[10px] font-bold mb-2">{localError || error}</p>}
            {icon}
            <div className="text-[11px] font-semibold text-neutral-600 mb-2">{title}</div>
            <p className="text-[10px] font-medium text-neutral-400">{subtitle}</p>
          </>
        )}
      </div>
    </div>
  );
};

const MultiDropzone = ({
  icon,
  title,
  subtitle,
  onFilesAdd,
  onFileRemove,
  selectedFiles,
  verifyImages = false
}: {
  icon: React.ReactNode,
  title: React.ReactNode,
  subtitle: string,
  onFilesAdd: (files: File[]) => void,
  onFileRemove: (index: number) => void,
  selectedFiles: File[],
  verifyImages?: boolean
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setLocalError(null);

      if (verifyImages) {
        setIsVerifying(true);
        const validFiles: File[] = [];
        let rejectedCount = 0;

        for (const file of files) {
          if (file.type.startsWith('image/')) {
            try {
              const fd = new FormData();
              fd.append("file", file);
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/gems/validate-image`, {
                method: "POST",
                body: fd
              });

              if (res.ok) {
                const data = await res.json();
                if (data.is_gemstone) {
                  validFiles.push(file);
                } else {
                  rejectedCount++;
                }
              } else {
                validFiles.push(file); // fallback on error
              }
            } catch (err) {
              console.error("AI Validation error", err);
              validFiles.push(file); // fallback
            }
          } else {
            // non-images (e.g. video) pass through automatically
            validFiles.push(file);
          }
        }

        setIsVerifying(false);
        if (rejectedCount > 0) {
          setLocalError(`AI Verification Failed: ${rejectedCount} image(s) did not appear to be gemstones and were removed.`);
        }

        if (validFiles.length > 0) {
          onFilesAdd(validFiles);
        }
      } else {
        onFilesAdd(files);
      }

      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => { if (!isVerifying) fileInputRef.current?.click(); }}
        className={`border border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all ${isVerifying ? 'opacity-70 cursor-not-allowed border-neutral-300' : 'cursor-pointer border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400'}`}
      >
        <input
          type="file"
          multiple
          hidden
          ref={fileInputRef}
          onChange={handleFilesChange}
        />
        {isVerifying ? (
          <div className="flex flex-col items-center py-2">
            <Loader2 className="w-8 h-8 text-[#B87A5B] animate-spin mb-3" />
            <p className="text-[12px] font-bold text-[#B87A5B]">AI is verifying images...</p>
            <p className="text-[10px] text-neutral-400 mt-1">Please wait a moment</p>
          </div>
        ) : (
          <>
            {localError && <p className="text-red-500 text-[10px] font-bold mb-3">{localError}</p>}
            {icon}
            <div className="text-[11px] font-semibold text-neutral-600 mb-2">{title}</div>
            <p className="text-[10px] font-medium text-neutral-400">{subtitle}</p>
          </>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {selectedFiles.map((file, idx) => {
            const isVideo = file.type.includes("video") || file.name.endsWith(".mp4") || file.name.endsWith(".mov") || file.name.endsWith(".webm");
            const isImage = file.type.startsWith("image/");
            const previewUrl = (isImage || isVideo) ? URL.createObjectURL(file) : null;

            return (
              <div key={idx} className="relative group rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm aspect-square">
                {previewUrl ? (
                  isVideo ? (
                    <div className="w-full h-full relative bg-black">
                      <video src={previewUrl} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    </div>
                  ) : (
                    <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full bg-neutral-50 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-neutral-300" />
                  </div>
                )}

                {/* Overlay with file info on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                  <p className="text-[10px] font-bold text-white truncate w-full mb-1">{file.name}</p>
                  <p className="text-[9px] font-medium text-white/70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemove(idx);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                  title="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function SellGemPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data State
  const [formData, setFormData] = useState({
    gemstoneType: "Sapphire",
    category: "Loose Stone",
    cutStyle: "Faceted",
    treatment: "Normally Heated",
    shape: "Brilliant Cut",
    color: "Pink",
    clarity: "Loop Clean",
    month: "June",
    origin: "Sri Lanka",
    intensity: "Vivid",
    length: "",
    width: "",
    height: "",
    carat: "",
    price: "",
    mined: "Rathnapura, Sri Lanka",
    cutBy: "Local Artisan",
    cutLocation: "Rathnapura, Sri Lanka",
    certifiedBy: "GIA",
    certifiedLocation: "Colombo, Sri Lanka"
  });

  // File State
  const [sunlightImage, setSunlightImage] = useState<File | null>(null);
  const [studioImage, setStudioImage] = useState<File | null>(null);
  const [extraMedia, setExtraMedia] = useState<File[]>([]);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpdate = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field as soon as user types/selects
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const clearFileError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.gemstoneType) newErrors.gemstoneType = "Gemstone type is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.cutStyle) newErrors.cutStyle = "Cut style is required";
    if (!formData.treatment) newErrors.treatment = "Treatment is required";
    if (!formData.shape) newErrors.shape = "Shape is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.color) newErrors.color = "Color is required";
    if (!formData.clarity) newErrors.clarity = "Clarity is required";
    if (!formData.month) newErrors.month = "Birthstone month is required";
    if (!formData.origin) newErrors.origin = "Origin is required";
    if (!formData.intensity) newErrors.intensity = "Intensity is required";
    if (!formData.length) newErrors.length = "Required";
    if (!formData.width) newErrors.width = "Required";
    if (!formData.height) newErrors.height = "Required";
    if (!formData.carat || parseFloat(formData.carat) <= 0) newErrors.carat = "Carat weight is required";
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Price is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!sunlightImage) newErrors.sunlightImage = "Sunlight image is required";
    if (!studioImage) newErrors.studioImage = "Studio image is required";
    if (!formData.mined) newErrors.mined = "Mining location is required";
    if (!formData.cutBy) newErrors.cutBy = "Cut & polished info is required";
    if (!formData.cutLocation) newErrors.cutLocation = "Cut location is required";
    if (!formData.certifiedBy) newErrors.certifiedBy = "Certification body is required";
    if (!formData.certifiedLocation) newErrors.certifiedLocation = "Certification location is required";
    if (!certificate) newErrors.certificate = "Certificate document is required";
    if (!confirmed) newErrors.confirmed = "You must confirm before posting";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setIsSubmitting(true);

    const payload = new FormData();
    // Append JSON data
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });

    // Append Files
    if (sunlightImage) payload.append("sunlightImage", sunlightImage);
    if (studioImage) payload.append("studioImage", studioImage);
    extraMedia.forEach(file => payload.append("extraMedia", file));
    if (certificate) payload.append("certificate", certificate);

    // Append Seller ID
    if (session?.user?.id) {
      payload.append("sellerId", session.user.id);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/gems`, {
        method: "POST",
        body: payload
      });
      if (res.ok) {
        alert("Gemstone Ad Posted Successfully!");
        window.location.href = "/gems";
      } else {
        try {
          const err = await res.json();
          const message = err.detail || err.error || err.message || "Failed to create listing.";
          alert("Error: " + message);
        } catch {
          alert("Error: Failed to create listing. Please check your images and try again.");
        }
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while posting the gemstone. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 font-sans">
      <div className="bg-white border border-neutral-100 rounded-[40px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] p-8 md:p-14 relative overflow-hidden min-h-[600px]">

        {/* Step 1: Core Details */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-[28px] font-extrabold tracking-wide text-black mb-2">Sell Your Gem</h1>
            <p className="text-[12px] font-semibold text-[#B87A5B] mb-10">
              <span className="italic">Note:</span> Provide accurate details about your gemstone to help buyers evaluate its authenticity, quality, and value with confidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <Label>Gemstone Type</Label>
                <Select value={formData.gemstoneType} onChange={v => handleUpdate('gemstoneType', v)} placeholder="Sapphire" options={["Sapphire", "Ruby", "Emerald", "Diamond", "Spinel", "Alexandrite"]} error={errors.gemstoneType} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onChange={v => handleUpdate('category', v)} placeholder="Loose Stone" options={["Loose Stone", "Pair", "Lot", "Rough"]} error={errors.category} />
              </div>
              <div>
                <Label>Cut Style</Label>
                <Select value={formData.cutStyle} onChange={v => handleUpdate('cutStyle', v)} placeholder="Faceted" options={["Faceted", "Cabochon", "Mixed Cut", "Rough"]} error={errors.cutStyle} />
              </div>
              <div>
                <Label>Treatment</Label>
                <Select value={formData.treatment} onChange={v => handleUpdate('treatment', v)} placeholder="Normally Heated" options={["Unheated", "Normally Heated", "Beryllium Treated", "Glass Filled"]} error={errors.treatment} />
              </div>
            </div>

            <div className="mb-14">
              <Label>Shape</Label>
              <div className="mt-5">
                <ShapeSelector selectedShape={formData.shape} onSelect={v => handleUpdate('shape', v)} />
              </div>
              <ErrorText error={errors.shape} />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => { if (validateStep1()) setStep(2); }}
                className="flex items-center gap-3 bg-black hover:bg-neutral-800 transition-colors text-white text-[13px] font-bold tracking-widest uppercase px-8 py-4 rounded-xl shadow-md"
              >
                Next <span className="text-lg leading-none">&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Measurements & Specs */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors mb-10"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <Label>Color</Label>
                <Select value={formData.color} onChange={v => handleUpdate('color', v)} placeholder="Pink" options={["Pink", "Blue", "Red", "Yellow", "Green", "Purple", "White"]} error={errors.color} />
              </div>
              <div>
                <Label>Clarity</Label>
                <Select value={formData.clarity} onChange={v => handleUpdate('clarity', v)} placeholder="Loop Clean" options={["Loop Clean", "Eye Clean", "Included", "Very Slightly Included", "Slightly Included"]} error={errors.clarity} />
              </div>
              <div>
                <Label>Birthstone Month</Label>
                <Select value={formData.month} onChange={v => handleUpdate('month', v)} placeholder="June" options={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Any"]} error={errors.month} />
              </div>
              <div>
                <Label>Origin</Label>
                <Select value={formData.origin} onChange={v => handleUpdate('origin', v)} placeholder="Sri Lanka" options={["Sri Lanka", "Madagascar", "Myanmar", "Tanzania", "Colombia", "Brazil"]} error={errors.origin} />
              </div>
            </div>

            <div className="mb-10">
              <Label>Intensity</Label>
              <div className="mt-5">
                <IntensitySelector selected={formData.intensity} onSelect={v => handleUpdate('intensity', v)} />
              </div>
              <ErrorText error={errors.intensity} />
            </div>

            <div className="mb-10">
              <Label>Dimensions</Label>
              <div className="flex gap-4 mt-5">
                {[
                  { label: 'Length', key: 'length' as const },
                  { label: 'Width', key: 'width' as const },
                  { label: 'Height', key: 'height' as const }
                ].map(dim => (
                  <div key={dim.key} className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={formData[dim.key]}
                        onChange={e => handleUpdate(dim.key, e.target.value)}
                        placeholder={dim.label}
                        className={`w-full rounded-lg border bg-white pl-5 pr-10 py-3.5 text-[13px] font-semibold text-neutral-700 focus:outline-none appearance-none placeholder:text-neutral-400 placeholder:font-medium ${errors[dim.key] ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-black'
                          }`}
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400">mm</span>
                    </div>
                    <ErrorText error={errors[dim.key]} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-14 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Label>Carat Weight</Label>
                <div className="relative mt-5">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.carat}
                    onChange={e => handleUpdate('carat', e.target.value)}
                    placeholder="e.g. 4.25"
                    className={`w-full rounded-lg border bg-white pl-5 pr-12 py-3.5 text-[13px] font-semibold text-neutral-700 focus:outline-none appearance-none placeholder:text-neutral-400 placeholder:font-medium ${errors.carat ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-black'
                      }`}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400">ct</span>
                </div>
                <ErrorText error={errors.carat} />
              </div>

              <div>
                <Label>Price (USD)</Label>
                <div className="relative mt-5">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-neutral-700">$</span>
                  <input
                    type="number"
                    step="1"
                    value={formData.price}
                    onChange={e => handleUpdate('price', e.target.value)}
                    placeholder="e.g. 1500"
                    className={`w-full rounded-lg border bg-white pl-10 pr-5 py-3.5 text-[13px] font-semibold text-neutral-700 focus:outline-none appearance-none placeholder:text-neutral-400 placeholder:font-medium ${errors.price ? 'border-red-400 focus:border-red-500' : 'border-neutral-200 focus:border-black'
                      }`}
                  />
                </div>
                <ErrorText error={errors.price} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => { if (validateStep2()) setStep(3); }}
                className="flex items-center gap-3 bg-black hover:bg-neutral-800 transition-colors text-white text-[13px] font-bold tracking-widest uppercase px-8 py-4 rounded-xl shadow-md"
              >
                Next <span className="text-lg leading-none">&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Media & Verification */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors mb-10"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h2 className="text-[15px] font-bold text-black mb-2">Upload Images and Videos</h2>
            <p className="text-[12px] font-semibold text-[#B87A5B] mb-8">
              <span className="italic">Note:</span> Upload clear, high-quality <span className="underline decoration-[#B87A5B]/40 underline-offset-4">Sunlight image</span> and <span className="underline decoration-[#B87A5B]/40 underline-offset-4">Studio Light image</span> that accurately represent your gemstone's color, brilliance, cut, and clarity to help buyers make informed decisions with confidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Dropzone
                icon={<Sun className="w-7 h-7 text-neutral-400 mb-5" />}
                title={<>Drag and drop your natural daylight (sunlight) image</>}
                subtitle="JPG, JPEG, PNG, WebP files up to 2000px"
                label="☀️ Sunlight Image"
                selectedFile={sunlightImage}
                onFileSelect={(f) => { setSunlightImage(f); clearFileError('sunlightImage'); }}
                error={errors.sunlightImage}
                verifyImage={true}
              />
              <Dropzone
                icon={<Camera className="w-7 h-7 text-neutral-400 mb-5" />}
                title={<>Drag and drop your Studio image</>}
                subtitle="JPG, JPEG, PNG, WebP files up to 2000px"
                label="📷 Studio Image"
                selectedFile={studioImage}
                onFileSelect={(f) => { setStudioImage(f); clearFileError('studioImage'); }}
                error={errors.studioImage}
                verifyImage={true}
              />
            </div>

            <div className="mb-14">
              <MultiDropzone
                icon={<Upload className="w-7 h-7 text-neutral-400 mb-5" />}
                title={<>Drag and drop your extra images or videos</>}
                subtitle="JPG, PNG, WebP, MP4 files up to 2000px"
                selectedFiles={extraMedia}
                onFilesAdd={(files) => setExtraMedia(prev => [...prev, ...files])}
                onFileRemove={(idx) => setExtraMedia(prev => prev.filter((_, i) => i !== idx))}
                verifyImages={true}
              />
            </div>

            <h2 className="text-[15px] font-bold text-black mb-6">Gem Journey</h2>
            <div className="mb-6">
              <Label>Mined</Label>
              <Select value={formData.mined} onChange={v => handleUpdate('mined', v)} placeholder="Rathnapura, Sri Lanka" options={["Rathnapura, Sri Lanka", "Elahera, Sri Lanka", "Ilakaka, Madagascar"]} error={errors.mined} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label>Cut & Polished</Label>
                <Select value={formData.cutBy} onChange={v => handleUpdate('cutBy', v)} placeholder="Cut & Polished By" options={["Local Artisan", "Factory"]} error={errors.cutBy} />
              </div>
              <div className="flex items-end">
                <Select value={formData.cutLocation} onChange={v => handleUpdate('cutLocation', v)} placeholder="Rathnapura, Sri Lanka" options={["Rathnapura, Sri Lanka", "Beruwala, Sri Lanka"]} error={errors.cutLocation} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
              <div>
                <Label>Certified</Label>
                <Select value={formData.certifiedBy} onChange={v => handleUpdate('certifiedBy', v)} placeholder="Certified By" options={["GIA", "Gubelin", "SSEF", "NGJA", "Local Lab"]} error={errors.certifiedBy} />
              </div>
              <div className="flex items-end">
                <Select value={formData.certifiedLocation} onChange={v => handleUpdate('certifiedLocation', v)} placeholder="Rathnapura, Sri Lanka" options={["Colombo, Sri Lanka", "Geneva, Switzerland", "New York, USA"]} error={errors.certifiedLocation} />
              </div>
            </div>

            <h2 className="text-[15px] font-bold text-black mb-2">Gem Certificate</h2>
            <p className="text-[12px] font-semibold text-[#B87A5B] mb-5">
              <span className="italic">Note:</span> Upload legal gemstone certificate
            </p>
            <div className="mb-12">
              <Dropzone
                icon={<Upload className="w-7 h-7 text-[#B87A5B] mb-5" />}
                title={<>Drag and drop your gemstone certificate or <span className="text-[#B87A5B] hover:underline">click to browse</span></>}
                subtitle="PDF, JPG, PNG (Max 10 MB)"
                label="📄 Certificate"
                selectedFile={certificate}
                onFileSelect={(f) => { setCertificate(f); clearFileError('certificate'); }}
                error={errors.certificate}
              />
            </div>

            <div className="mb-14">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={e => { setConfirmed(e.target.checked); if (e.target.checked) clearFileError('confirmed'); }}
                  className={`mt-0.5 w-4 h-4 rounded text-black focus:ring-black cursor-pointer ${errors.confirmed ? 'border-red-400' : 'border-gray-300'
                    }`}
                />
                <p className={`text-[11px] font-medium leading-relaxed max-w-3xl ${errors.confirmed ? 'text-red-500' : 'text-neutral-500'
                  }`}>
                  I confirm that all information, images, and documents provided in this listing are accurate and truthful. I understand that I am solely responsible for any false, misleading, or fraudulent information submitted.
                </p>
              </div>
              <ErrorText error={errors.confirmed} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-neutral-100">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full sm:w-auto px-10 py-4 rounded-xl border-2 border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-colors text-black text-[13px] font-bold tracking-widest uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !confirmed}
                className="w-full sm:w-auto px-12 py-4 rounded-xl bg-black hover:bg-neutral-800 transition-colors text-white text-[13px] font-bold tracking-widest uppercase shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Posting..." : "Post Gemstone Ad"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
