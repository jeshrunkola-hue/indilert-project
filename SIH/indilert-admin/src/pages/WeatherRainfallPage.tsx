import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { WeatherData } from '../types';
import {
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  Compass,
  Calendar,
  CloudLightning
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const WeatherRainfallPage: React.FC = () => {
  const [currentDistrict, setCurrentDistrict] = useState('East Khasi Hills');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [rainfallSummary, setRainfallSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const districtsList = [
    'East Khasi Hills',
    'Dima Hasao',
    'Mangan',
    'Kohima',
    'Tawang',
    'Aizawl',
    'Tamenglong',
    'North Tripura'
  ];

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        const [wData, fData, rData] = await Promise.all([
          api.getCurrentWeather(currentDistrict),
          api.getWeatherForecast(currentDistrict),
          api.getRainfallSummary()
        ]);
        setWeather(wData);
        setForecast(fData);
        setRainfallSummary(rData);
      } catch (err) {
        console.error('Failed to load weather:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeatherData();
  }, [currentDistrict]);

  return (
    <div className="space-y-6">
      {/* Header & District Selector */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <CloudRain className="w-5 h-5 text-sky-400" />
            <h1 className="text-base font-bold text-white">Meteorological & Precipitation Monitoring</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              IMD AWS FEED ADAPTER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Doppler Weather Radar (Sohra/Guwahati) & Automatic Weather Station network tracking
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Select Monitored District:</span>
          <select
            value={currentDistrict}
            onChange={(e) => setCurrentDistrict(e.target.value)}
            className="bg-slate-800 text-white text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
          >
            {districtsList.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {weather && (
        <>
          {/* Active Weather Warning Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            weather.weather_warning.includes('RED') ? 'bg-rose-950/40 border-rose-600/40 text-rose-200' :
            weather.weather_warning.includes('ORANGE') ? 'bg-orange-950/40 border-orange-600/40 text-orange-200' :
            weather.weather_warning.includes('YELLOW') ? 'bg-amber-950/40 border-amber-600/40 text-amber-200' :
            'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
          }`}>
            <div className="flex items-center space-x-3">
              <CloudLightning className="w-6 h-6 animate-pulse" />
              <div>
                <span className="font-bold text-sm block">IMD Regional Bulletin:</span>
                <p className="text-xs">{weather.weather_warning}</p>
              </div>
            </div>
            <span className="text-xs opacity-75 font-mono">
              Intensity: {weather.rainfall_intensity}
            </span>
          </div>

          {/* Meteorological Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[11px] block">Current Rain Rate</span>
              <div className="text-xl font-black text-sky-400 mt-1">{weather.current_rainfall_rate_mm_h} mm/h</div>
              <span className="text-[10px] text-slate-500">Live gauge</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[11px] block">1-Hour Cumulative</span>
              <div className="text-xl font-black text-white mt-1">{weather.rainfall_1h_mm} mm</div>
              <span className="text-[10px] text-slate-500">Last 60 mins</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[11px] block">3-Hour Cumulative</span>
              <div className="text-xl font-black text-white mt-1">{weather.rainfall_3h_mm} mm</div>
              <span className="text-[10px] text-slate-500">Last 180 mins</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[11px] block">6-Hour Cumulative</span>
              <div className="text-xl font-black text-amber-400 mt-1">{weather.rainfall_6h_mm} mm</div>
              <span className="text-[10px] text-slate-500">Infiltration load</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[11px] block">24-Hour Total</span>
              <div className="text-xl font-black text-rose-500 mt-1">{weather.rainfall_24h_mm} mm</div>
              <span className="text-[10px] text-slate-500">Threshold: &gt;100mm</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 text-[11px] block">Forecast 24h</span>
              <div className="text-xl font-black text-indigo-400 mt-1">{weather.forecast_24h_mm} mm</div>
              <span className="text-[10px] text-slate-500">Numerical model</span>
            </div>
          </div>

          {/* Microclimate Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
              <Thermometer className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-slate-400 text-[11px]">Surface Temperature</span>
                <p className="text-sm font-bold text-white">{weather.temperature_c} °C</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
              <Droplets className="w-5 h-5 text-sky-400" />
              <div>
                <span className="text-slate-400 text-[11px]">Relative Humidity</span>
                <p className="text-sm font-bold text-white">{weather.humidity_percent}%</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
              <Wind className="w-5 h-5 text-slate-300" />
              <div>
                <span className="text-slate-400 text-[11px]">Wind Velocity & Direction</span>
                <p className="text-sm font-bold text-white">{weather.wind_speed_kmh} km/h (SSW)</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Charts: Multi-district Rainfall Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-bold text-white mb-1">Precipitation Across NER Districts (24h)</h3>
          <p className="text-xs text-slate-400 mb-4">Comparing continuous precipitation volume</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rainfallSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="district" stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" fontSize={11} unit=" mm" />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="rainfall_24h" fill="#38BDF8" name="24h Rain (mm)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5-Day Outlook */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-bold text-white mb-1">5-Day Numerical Weather Forecast ({currentDistrict})</h3>
          <p className="text-xs text-slate-400 mb-4">Projected daily precipitation and alert posture</p>
          <div className="space-y-2.5">
            {forecast.map((f, i) => (
              <div key={i} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-white">Day +{f.day_offset} Outlook</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-slate-300">Expected: <strong>{f.expected_rainfall_mm} mm</strong></span>
                  <span className="text-slate-400">Prob: {f.probability_of_precipitation}%</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    f.alert_level === 'WARNING' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {f.alert_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
