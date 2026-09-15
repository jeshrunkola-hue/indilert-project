import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Sensor } from '../types';
import { useApp } from '../context/AppContext';
import {
  Radio,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Wifi,
  MapPin,
  RefreshCw,
  Plus,
  Activity,
  Droplets,
  Compass
} from 'lucide-react';

export const SensorsPage: React.FC = () => {
  const { refreshKey, triggerRefresh } = useApp();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const data = await api.getSensors();
        setSensors(data);
      } catch (err) {
        console.error('Failed to load sensors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSensors();
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h1 className="text-base font-bold text-white">Geotechnical IoT & Soil Moisture Telemetry</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              LoRaWAN / NB-IoT ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time subsurface volumetric moisture probes, vibrating wire piezometers, and MEMS inclinometers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={triggerRefresh}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Poll Telemetry</span>
          </button>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((s) => (
          <div
            key={s.id}
            className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3 shadow-sm hover:border-slate-700 transition"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">{s.sensor_code}</span>
                <h3 className="text-xs font-bold text-white leading-tight">{s.name}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                s.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                s.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {s.status}
              </span>
            </div>

            {/* Subsurface Moisture Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 flex items-center">
                  <Droplets className="w-3.5 h-3.5 text-sky-400 mr-1" />
                  Soil Moisture Saturation:
                </span>
                <span className={`font-bold ${s.soil_moisture > 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {s.soil_moisture}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    s.soil_moisture >= 80 ? 'bg-rose-500' :
                    s.soil_moisture >= 65 ? 'bg-orange-500' :
                    s.soil_moisture >= 45 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${s.soil_moisture}%` }}
                />
              </div>
            </div>

            {/* Geotechnical Parameters */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Pore Water Pressure</span>
                <span className="font-bold text-white">{s.pore_water_pressure_kpa} kPa</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Inclinometer Tilt</span>
                <span className="font-bold text-white">{s.tilt_degrees}°</span>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>{s.district_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Battery className={`w-3.5 h-3.5 ${s.battery_level > 30 ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span>{s.battery_level}% Battery</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
