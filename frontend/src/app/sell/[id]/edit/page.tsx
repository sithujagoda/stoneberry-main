"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, Sun, Camera, Check, X, Video, Image as ImageIcon } from "lucide-react";
import ShapeSelector from "@/components/ShapeSelector";
import IntensitySelector from "@/components/IntensitySelector";

// Shared components for styling the form
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[13px] font-bold text-neutral-800 mb-3">{children}</label>
);

const Select = ({ value, onChange, options, placeholder }: { value?: string, onChange?: (val: string) => void, options: string[], placeholder: string }) => (
  <select 
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className="w-full rounded-lg border border-neutral-200 bg-white px-5 py-3.5 text-[13px] font-semibold text-neutral-600 focus:outline-none focus:border-black appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_1.2rem_center]"
  >
    <option value="" disabled>{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const Dropzone = ({
  icon,
  title,
  subtitle,
  onFileSelect,
  selectedFile,
  existingUrl
}: {
  icon: React.ReactNode,
  title: React.ReactNode,
  subtitle: string,
  onFileSelect: (f: File) => void,
  selectedFile: File | null,
  existingUrl?: string | null
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className={`relative overflow-hidden border border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
        selectedFile ? 'border-[#B87A5B] bg-[#B87A5B]/5 p-10' : existingUrl ? 'border-neutral-200 bg-neutral-50 p-0 h-48' : 'border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 p-10'
      }`}
    >
      <input 
        type="file" 
        hidden 
        ref={fileInputRef} 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
          }
        }} 
      />
      {selectedFile ? (
        <div className="flex flex-col items-center animate-in zoom-in duration-300">
          <div className="w-10 h-10 rounded-full bg-[#B87A5B]/10 flex items-center justify-center mb-3">
             <Check className="w-5 h-5 text-[#B87A5B]" />
          </div>
          <p className="text-[12px] font-bold text-[#B87A5B] mb-1">{selectedFile.name}</p>
          <p className="text-[10px] font-medium text-neutral-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      ) : existingUrl ? (
        <div className="w-full h-full flex items-center justify-center group relative">
          {existingUrl.includes('.pdf') ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mb-3">
                 <Check className="w-5 h-5 text-white" />
              </div>
              <p className="text-[12px] font-bold text-black mb-1">Existing Document Uploaded</p>
              <p className="text-[10px] font-medium text-neutral-500">Click to replace</p>
            </div>
          ) : (
            <img src={existingUrl} alt="Existing" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-[12px] font-bold uppercase tracking-widest">Change File</span>
          </div>
        </div>
      ) : (
        <>
          {icon}
          <div className="text-[11px] font-semibold text-neutral-600 mb-2">{title}</div>
          <p className="text-[10px] font-medium text-neutral-400">{subtitle}</p>
        </>
      )}
    </div>
  );
};

const EditMultiDropzone = ({
  icon,
  title,
  subtitle,
  existingUrls,
  onRemoveExistingUrl,
  selectedFiles,
  onFilesAdd,
  onFileRemove
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: string;
  existingUrls: string[];
  onRemoveExistingUrl: (index: number) => void;
  selectedFiles: File[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400"
      >
        <input 
          type="file" 
          multiple
          hidden 
          ref={fileInputRef} 
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFilesAdd(Array.from(e.target.files));
              e.target.value = '';
            }
          }} 
        />
        {icon}
        <div className="text-[11px] font-semibold text-neutral-600 mb-2">{title}</div>
        <p className="text-[10px] font-medium text-neutral-400">{subtitle}</p>
      </div>

      {(existingUrls.length > 0 || selectedFiles.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {existingUrls.map((url, idx) => {
            const isVideo = url.endsWith(".mp4") || url.endsWith(".mov") || url.endsWith(".webm") || url.includes("video");
            return (
              <div key={`existing-${idx}`} className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50 shadow-sm">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-[#B87A5B]/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                    {isVideo ? (
                      <Video className="w-5 h-5 text-[#B87A5B]" />
                    ) : (
                      <img src={url} alt="Existing" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-black truncate">Existing Upload #{idx + 1}</p>
                    <p className="text-[10px] font-medium text-neutral-400">{isVideo ? "Video" : "Image"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveExistingUrl(idx);
                  }}
                  className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-500 hover:text-red-500 transition-colors"
                  title="Remove existing file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {selectedFiles.map((file, idx) => {
            const isVideo = file.type.includes("video") || file.name.endsWith(".mp4") || file.name.endsWith(".mov") || file.name.endsWith(".webm");
            return (
              <div key={`selected-${idx}`} className="flex items-center justify-between p-3 rounded-xl border border-[#B87A5B]/30 bg-[#B87A5B]/5 shadow-sm">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-[#B87A5B]/10 flex items-center justify-center shrink-0">
                    {isVideo ? <Video className="w-5 h-5 text-[#B87A5B]" /> : <ImageIcon className="w-5 h-5 text-[#B87A5B]" />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-bold text-black truncate">{file.name}</p>
                    <p className="text-[10px] font-medium text-neutral-500">New • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemove(idx);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#B87A5B]/10 text-neutral-500 hover:text-red-500 transition-colors"
                  title="Remove new file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function EditGemPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const gemId = params.id as string;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [formData, setFormData] = useState({
    gemstoneType: "",
    category: "",
    cutStyle: "",
    treatment: "",
    shape: "Brilliant Cut",
    color: "",
    clarity: "",
    month: "",
    origin: "",
    intensity: "Vivid",
    length: "",
    width: "",
    height: "",
    carat: "",
    price: "",
    mined: "",
    cutBy: "",
    cutLocation: "",
    certifiedBy: "",
    certifiedLocation: ""
  });

  // File State
  const [sunlightImage, setSunlightImage] = useState<File | null>(null);
  const [studioImage, setStudioImage] = useState<File | null>(null);
  const [extraMedia, setExtraMedia] = useState<File[]>([]);
  const [certificate, setCertificate] = useState<File | null>(null);
  
  // Existing URLs
  const [existingUrls, setExistingUrls] = useState({
    sunlight: null as string | null,
    studio: null as string | null,
    extra: [] as string[],
    cert: null as string | null
  });

  const [confirmed, setConfirmed] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!gemId) return;
    const fetchGem = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${apiUrl}/api/gems/${gemId}`);
        const result = await res.json();
        if (result.success && result.data) {
          const gem = result.data;
          // Check ownership
          if (session?.user?.id && gem.seller_id.toString() !== session.user.id.toString()) {
            alert("You are not authorized to edit this gem.");
            router.push('/');
            return;
          }
          setFormData({
            gemstoneType: gem.gemstone_type || "",
            category: gem.category || "",
            cutStyle: gem.cut_style || "",
            treatment: gem.treatment || "",
            shape: gem.shape || "Brilliant Cut",
            color: gem.color || "",
            clarity: gem.clarity || "",
            month: gem.month || "",
            origin: gem.origin || "",
            intensity: gem.intensity || "Vivid",
            length: gem.length?.toString() || "",
            width: gem.width?.toString() || "",
            height: gem.height?.toString() || "",
            carat: gem.weight_carat?.toString() || "",
            price: gem.price_usd?.toString() || "",
            mined: gem.mined || "",
            cutBy: gem.cut_by || "",
            cutLocation: gem.cut_location || "",
            certifiedBy: gem.certified_by || "",
            certifiedLocation: gem.certified_location || ""
          });

          let parsedExtra: string[] = [];
          if (gem.extra_media_url) {
            try {
              const p = JSON.parse(gem.extra_media_url);
              parsedExtra = Array.isArray(p) ? p : [gem.extra_media_url];
            } catch {
              parsedExtra = [gem.extra_media_url];
            }
          }

          setExistingUrls({
            sunlight: gem.sunlight_image_url || null,
            studio: gem.studio_image_url || null,
            extra: parsedExtra,
            cert: gem.certificate_url || null
          });
          setIsAvailable(gem.is_available ?? true);
        } else {
          alert("Failed to load gem details.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (status === 'authenticated') {
      fetchGem();
    }
  }, [gemId, status, session, router]);

  const handleUpdate = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!confirmed) return alert("Please confirm the terms before posting.");
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
    payload.append("existingExtraUrls", JSON.stringify(existingUrls.extra));
    if (certificate) payload.append("certificate", certificate);
    
    // Append Seller ID & Availability
    if (session?.user?.id) {
      payload.append("sellerId", session.user.id);
    }
    payload.append("isAvailable", isAvailable.toString());

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/gems/${gemId}`, {
        method: "PUT",
        body: payload
      });
      if (res.ok) {
        alert("Gemstone Ad Updated Successfully!");
        router.push(`/gems/${gemId}`);
      } else {
        const err = await res.json();
        alert("Error: " + err.detail);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while updating the gemstone.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 font-sans">
      <div className="bg-white border border-neutral-100 rounded-[40px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] p-8 md:p-14 relative overflow-hidden min-h-[600px]">
        
        {/* Step 1: Core Details */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-[28px] font-extrabold tracking-wide text-black">Edit Your Gem</h1>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-neutral-600 uppercase tracking-widest">Status:</span>
                <button 
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors ${
                    isAvailable ? 'bg-[#00A859]/10 text-[#00A859]' : 'bg-red-50 text-red-500'
                  }`}
                >
                  {isAvailable ? 'Available' : 'Unavailable'}
                </button>
              </div>
            </div>
            <p className="text-[12px] font-semibold text-[#B87A5B] mb-10">
              <span className="italic">Note:</span> Provide accurate details about your gemstone to help buyers evaluate its authenticity, quality, and value with confidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <Label>Gemstone Type</Label>
                <Select value={formData.gemstoneType} onChange={v => handleUpdate('gemstoneType', v)} placeholder="Sapphire" options={["Sapphire", "Ruby", "Emerald", "Diamond", "Spinel", "Alexandrite"]} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onChange={v => handleUpdate('category', v)} placeholder="Loose Stone" options={["Loose Stone", "Pair", "Lot", "Rough"]} />
              </div>
              <div>
                <Label>Cut Style</Label>
                <Select value={formData.cutStyle} onChange={v => handleUpdate('cutStyle', v)} placeholder="Faceted" options={["Faceted", "Cabochon", "Mixed Cut", "Rough"]} />
              </div>
              <div>
                <Label>Treatment</Label>
                <Select value={formData.treatment} onChange={v => handleUpdate('treatment', v)} placeholder="Normally Heated" options={["Unheated", "Normally Heated", "Beryllium Treated", "Glass Filled"]} />
              </div>
            </div>

            <div className="mb-14">
              <Label>Shape</Label>
              <div className="mt-5">
                <ShapeSelector selectedShape={formData.shape} onSelect={v => handleUpdate('shape', v)} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep(2)} 
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
                <Select value={formData.color} onChange={v => handleUpdate('color', v)} placeholder="Pink" options={["Pink", "Blue", "Red", "Yellow", "Green", "Purple", "White"]} />
              </div>
              <div>
                <Label>Clarity</Label>
                <Select value={formData.clarity} onChange={v => handleUpdate('clarity', v)} placeholder="Loop Clean" options={["Loop Clean", "Eye Clean", "Included", "Very Slightly Included", "Slightly Included"]} />
              </div>
              <div>
                <Label>Birthstone Month</Label>
                <Select value={formData.month} onChange={v => handleUpdate('month', v)} placeholder="June" options={["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Any"]} />
              </div>
              <div>
                <Label>Origin</Label>
                <Select value={formData.origin} onChange={v => handleUpdate('origin', v)} placeholder="Sri Lanka" options={["Sri Lanka", "Madagascar", "Myanmar", "Tanzania", "Colombia", "Brazil"]} />
              </div>
            </div>

            <div className="mb-10">
              <Label>Intensity</Label>
              <div className="mt-5">
                <IntensitySelector selected={formData.intensity} onSelect={v => handleUpdate('intensity', v)} />
              </div>
            </div>

            <div className="mb-10">
              <Label>Dimensions</Label>
              <div className="flex gap-4 mt-5">
                {[
                  { label: 'Length', key: 'length' as const },
                  { label: 'Width', key: 'width' as const },
                  { label: 'Height', key: 'height' as const }
                ].map(dim => (
                  <div key={dim.key} className="relative flex-1">
                    <input 
                      type="number" 
                      step="0.1" 
                      value={formData[dim.key]}
                      onChange={e => handleUpdate(dim.key, e.target.value)}
                      placeholder={dim.label} 
                      className="w-full rounded-lg border border-neutral-200 bg-white pl-5 pr-10 py-3.5 text-[13px] font-semibold text-neutral-700 focus:outline-none focus:border-black appearance-none placeholder:text-neutral-400 placeholder:font-medium" 
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400">mm</span>
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
                    className="w-full rounded-lg border border-neutral-200 bg-white pl-5 pr-12 py-3.5 text-[13px] font-semibold text-neutral-700 focus:outline-none focus:border-black appearance-none placeholder:text-neutral-400 placeholder:font-medium" 
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400">ct</span>
                </div>
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
                    className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-5 py-3.5 text-[13px] font-semibold text-neutral-700 focus:outline-none focus:border-black appearance-none placeholder:text-neutral-400 placeholder:font-medium" 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep(3)} 
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
                selectedFile={sunlightImage}
                onFileSelect={setSunlightImage}
                existingUrl={existingUrls.sunlight}
              />
              <Dropzone 
                icon={<Camera className="w-7 h-7 text-neutral-400 mb-5" />}
                title={<>Drag and drop your Studio image</>}
                subtitle="JPG, JPEG, PNG, WebP files up to 2000px"
                selectedFile={studioImage}
                onFileSelect={setStudioImage}
                existingUrl={existingUrls.studio}
              />
            </div>

            <div className="mb-14">
              <EditMultiDropzone 
                icon={<Upload className="w-7 h-7 text-neutral-400 mb-5" />}
                title={<>Drag and drop your extra images or videos</>}
                subtitle="JPG, PNG, WebP, MP4 files up to 2000px"
                existingUrls={existingUrls.extra}
                onRemoveExistingUrl={(idx) => setExistingUrls(prev => ({ ...prev, extra: prev.extra.filter((_, i) => i !== idx) }))}
                selectedFiles={extraMedia}
                onFilesAdd={(files) => setExtraMedia(prev => [...prev, ...files])}
                onFileRemove={(idx) => setExtraMedia(prev => prev.filter((_, i) => i !== idx))}
              />
            </div>

            <h2 className="text-[15px] font-bold text-black mb-6">Gem Journey</h2>
            <div className="mb-6">
              <Label>Mined</Label>
              <Select value={formData.mined} onChange={v => handleUpdate('mined', v)} placeholder="Rathnapura, Sri Lanka" options={["Rathnapura, Sri Lanka", "Elahera, Sri Lanka", "Ilakaka, Madagascar"]} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label>Cut & Polished</Label>
                <Select value={formData.cutBy} onChange={v => handleUpdate('cutBy', v)} placeholder="Cut & Polished By" options={["Local Artisan", "Factory"]} />
              </div>
              <div className="flex items-end">
                <Select value={formData.cutLocation} onChange={v => handleUpdate('cutLocation', v)} placeholder="Rathnapura, Sri Lanka" options={["Rathnapura, Sri Lanka", "Beruwala, Sri Lanka"]} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
              <div>
                <Label>Certified</Label>
                <Select value={formData.certifiedBy} onChange={v => handleUpdate('certifiedBy', v)} placeholder="Certified By" options={["GIA", "Gubelin", "SSEF", "NGJA", "Local Lab"]} />
              </div>
              <div className="flex items-end">
                <Select value={formData.certifiedLocation} onChange={v => handleUpdate('certifiedLocation', v)} placeholder="Rathnapura, Sri Lanka" options={["Colombo, Sri Lanka", "Geneva, Switzerland", "New York, USA"]} />
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
                selectedFile={certificate}
                onFileSelect={setCertificate}
                existingUrl={existingUrls.cert}
              />
            </div>

            <div className="flex items-start gap-4 mb-14">
              <input 
                type="checkbox" 
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" 
              />
              <p className="text-[11px] font-medium text-neutral-500 leading-relaxed max-w-3xl">
                I confirm that all information, images, and documents provided in this listing are accurate and truthful. I understand that I am solely responsible for any false, misleading, or fraudulent information submitted.
              </p>
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
                {isSubmitting ? "Updating..." : "Update Gemstone Ad"}
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
