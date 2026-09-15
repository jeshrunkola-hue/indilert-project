"use client";

import { Search, Crosshair, X } from "lucide-react";
import DynamicMap from "../components/DynamicMap";
import { useState } from "react";

export default function MapPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null);
  const [searchedName, setSearchedName] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResults([]);
    try {
      // Using Open-Meteo Geocoding API which is highly reliable and CORS-friendly
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result: any) => {
    setSearchedLocation([result.latitude, result.longitude]);
    const shortName = result.name;
    setSearchedName(shortName);
    setQuery(shortName);
    setResults([]);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearchedLocation(null);
    setSearchedName("");
  };

  const formatDisplayName = (r: any) => {
    return [r.name, r.admin1, r.country].filter(Boolean).join(", ");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 relative">
      <header className="bg-white border-b border-slate-200 p-4 z-20 flex flex-col space-y-3 relative shadow-md">
        <h1 className="text-xl font-black text-slate-800 text-center tracking-wide">SAFETY MAP</h1>
        
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location..." 
            className="w-full bg-slate-100 rounded-lg py-3 pl-11 pr-10 text-slate-800 font-medium border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-inner"
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className={`absolute left-2 top-2 p-1.5 transition-all rounded-md ${isSearching ? 'text-slate-300' : 'text-slate-500 hover:text-blue-600 active:scale-95'}`}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          
          {query && (
            <button 
              type="button" 
              onClick={clearSearch}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-[500]">
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectResult(r)}
                  className="w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <p className="font-bold text-sm text-slate-800">{r.name}</p>
                  <p className="text-xs text-slate-500 truncate">{formatDisplayName(r)}</p>
                </button>
              ))}
            </div>
          )}
        </form>
      </header>

      {/* Real Map Area */}
      <main className="flex-1 relative z-10">
        <DynamicMap 
          showRouting={false} 
          zoom={15} 
          searchedLocation={searchedLocation}
          searchedName={searchedName}
        />

        {/* Map Controls Overlay */}
        <div className="absolute bottom-6 right-4 flex flex-col space-y-2 z-[400]">
          <button 
            onClick={clearSearch}
            className="bg-white p-3 rounded-full shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex flex-col items-center justify-center"
            aria-label="Recenter on Me"
          >
            <Crosshair className={`w-6 h-6 ${searchedLocation ? 'text-slate-700' : 'text-blue-600'}`} />
          </button>
        </div>
      </main>
    </div>
  );
}
