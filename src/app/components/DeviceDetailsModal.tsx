"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface DeviceDetails {
  ip: string;
  cpu: number;
  ram: number;
  disk_used: number;
  disk_total: number;
  disk_percent: number;
}

const CircularProgress = ({ value, label, size = 120 }: { value: number, label: string, size?: number }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (value / 100) * circumference;
    
    const getUsageColor = (val: number) => {
      if (val > 80) return '#ef4444';
      if (val > 60) return '#f59e0b';
      return '#10b981';
    };
    const color = getUsageColor(value);
  
    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="transform -rotate-90" width={size} height={size}>
            <circle cx={size / 2} cy={size / 2} r="45" stroke="#374151" strokeWidth="8" fill="none" />
            <circle
              cx={size / 2}
              cy={size / 2}
              r="45"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{value.toFixed(0)}%</span>
          </div>
        </div>
        <span className="mt-2 text-sm text-gray-400 font-medium">{label}</span>
      </div>
    );
  };

export default function DeviceDetailsModal({ ip, onClose }: { ip: string, onClose: () => void }) {
  const [details, setDetails] = useState<DeviceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get<DeviceDetails>(`/api/device-status?ip=${ip}`);
        setDetails(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch device details. The agent might be offline or unreachable.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [ip]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 w-full max-w-md m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Device Details: {ip}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        {loading && <p>Loading details...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {details && (
          <div className="grid grid-cols-3 gap-4">
            <CircularProgress value={details.cpu} label="CPU" />
            <CircularProgress value={details.ram} label="RAM" />
            <CircularProgress value={details.disk_percent} label="Disk" />
          </div>
        )}
      </div>
    </div>
  );
}
