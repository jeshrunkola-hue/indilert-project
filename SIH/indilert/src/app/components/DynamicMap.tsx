"use client";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center">
      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
      <span className="text-slate-600 font-bold text-xs">Loading Live Map...</span>
    </div>
  ),
});

export default DynamicMap;
