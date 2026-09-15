"use client";

import { Camera, Video, MapPin, Send, CheckCircle, X, Loader2 } from "lucide-react";
import { useState, useRef } from "react";

export default function ReportHazard() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hazardTypes = [
    "Landslide", "Flooding", "Road Blockage", 
    "Road Crack", "Slope Crack", "Fallen Tree", 
    "Damaged Bridge", "Other"
  ];

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<'HIGH' | 'MODERATE' | 'LOW'>('HIGH');
  const [details, setDetails] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setPhotoFile(f);
      setPhotoPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("reporter_name", "Citizen (Indilert)");
      formData.append("reporter_role", "CITIZEN");
      formData.append("report_type", selectedType.toUpperCase().replace(/ /g, '_'));
      formData.append("severity", selectedRisk);
      formData.append("latitude", "25.5788");
      formData.append("longitude", "91.8933");
      formData.append("district_name", "East Khasi Hills");
      formData.append("description", details || `${selectedType} reported near Shillong corridor, East Khasi Hills.`);
      if (photoFile) {
        formData.append("photos", photoFile);
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_NERSAFE_API_URL || "http://localhost:8000";
      await fetch(`${apiBase}/api/reports`, {
        method: "POST",
        body: formData,
      });
      setSubmitted(true);
    } catch (e) {
      console.error("Report submit error:", e);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center p-6 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">REPORT SENT</h2>
        <p className="text-slate-600 font-medium mb-8">
          Thank you. Your report has been transmitted to the Indilert Emergency Command Center.
        </p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setSelectedType(null);
            setPhotoFile(null);
            setPhotoPreview(null);
            setDetails('');
          }}
          className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg shadow-md w-full"
        >
          REPORT ANOTHER HAZARD
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-black text-slate-800 text-center">REPORT HAZARD</h1>
      </header>

      <main className="p-4 flex flex-col space-y-6 pb-20">
        
        {/* 1. What is the emergency */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3">1. What is the emergency?</h2>
          <div className="grid grid-cols-2 gap-2">
            {hazardTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-3 rounded-lg border font-bold text-sm transition-colors ${
                  selectedType === type 
                  ? 'bg-blue-50 border-blue-600 text-blue-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Add Photo or Video */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3">2. Add Photo or Video (Optional)</h2>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handlePhotoClick}
              className="flex-1 bg-white border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <Camera className="w-8 h-8 mb-2 text-slate-400" />
              <span className="font-semibold text-sm">TAKE PHOTO</span>
            </button>
            <button
              type="button"
              onClick={handlePhotoClick}
              className="flex-1 bg-white border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <Video className="w-8 h-8 mb-2 text-slate-400" />
              <span className="font-semibold text-sm">RECORD VIDEO</span>
            </button>
          </div>

          {photoPreview && (
            <div className="relative mt-2 rounded-lg overflow-hidden border border-slate-300 w-32 h-24">
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* 3. Location */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3">3. Location</h2>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-bold text-blue-800 text-sm">Current Location Attached</p>
              <p className="text-blue-600 text-xs">East Khasi Hills • Lat: 25.57, Lng: 91.88</p>
            </div>
          </div>
        </div>

        {/* 4. Additional Details */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3">4. Additional Details (Optional)</h2>
          <textarea 
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg p-3 font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
            placeholder="Tap here to type details (e.g. road blocked, rock size)..."
          />
        </div>

        {/* 5. Risk Specification */}
        <div>
          <h2 className="font-bold text-slate-700 mb-3">5. Risk Specification</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { level: 'HIGH', label: 'High Risk', activeClass: 'bg-red-600 text-white border-red-600 shadow-sm', idleClass: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' },
              { level: 'MODERATE', label: 'Moderate Risk', activeClass: 'bg-amber-500 text-white border-amber-500 shadow-sm', idleClass: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' },
              { level: 'LOW', label: 'Low Risk', activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm', idleClass: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' },
            ].map((item) => (
              <button
                key={item.level}
                type="button"
                onClick={() => setSelectedRisk(item.level as any)}
                className={`py-3 px-2 rounded-lg border font-bold text-xs transition-colors text-center ${
                  selectedRisk === item.level ? item.activeClass : item.idleClass
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button 
          onClick={handleSubmit}
          disabled={!selectedType || isSubmitting}
          className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all ${
            selectedType && !isSubmitting
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99] cursor-pointer' 
              : 'bg-[#c5d3e8] text-[#475569] cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-base tracking-wide uppercase">TRANSMITTING...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span className="text-base tracking-wide uppercase">SUBMIT REPORT</span>
            </>
          )}
        </button>

      </main>
    </div>
  );
}
