"use client";

import { useState, useEffect, useCallback } from 'react';
import { Activity, Server, Monitor, Plus, X, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface Device {
  ip: string;
  name: string;
  type: 'pc' | 'server';
}

interface DeviceStatus extends Device {
  status: 'online' | 'offline';
  latency: string;
  details: {
    cpu: number | 'N/A';
    ram: number | 'N/A';
    disk_percent: number | 'N/A';
  };
}

const CircularProgress = ({ value, label, size = 100 }: { value: number | 'N/A', label: string, size?: number }) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (numericValue / 100) * circumference;
  
  const getUsageColor = (val: number) => {
    if (val > 80) return '#ef4444';
    if (val > 60) return '#f59e0b';
    return '#10b981';
  };
  const color = getUsageColor(numericValue);

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
          <span className="text-2xl font-bold text-white">{typeof numericValue === 'number' ? numericValue.toFixed(0) : 'N/A'}%</span>
        </div>
      </div>
      <span className="mt-2 text-sm text-gray-400 font-medium">{label}</span>
    </div>
  );
};

const DeviceCard = ({ device, onRemove }: { device: DeviceStatus, onRemove: (ip: string, type: 'pc' | 'server') => void }) => {

  return (
    <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={device.status === 'online' ? 'text-blue-400' : 'text-gray-600'}>
            {device.type === 'server' ? <Server className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="font-semibold text-white">{device.name || device.ip}</h3>
            <p className="text-xs text-gray-400">{device.ip}</p>
            <p className="text-xs text-gray-500 capitalize">{device.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {device.status === 'online' ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
          <button onClick={() => onRemove(device.ip, device.type)} className="p-1 hover:bg-gray-700 rounded transition-colors">
            <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${device.status === 'online' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
        <div className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-green-400' : 'bg-red-400'} ${device.status === 'online' ? 'animate-pulse' : ''}`} />
        {device.status === 'online' ? 'ONLINE' : 'OFFLINE'}
        {device.status === 'online' && <span className="text-gray-400 text-xs">({device.latency})</span>}
      </div>

      {device.status === 'online' && device.details.cpu !== 'N/A' ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <CircularProgress value={device.details.cpu} label="CPU" size={100} />
          <CircularProgress value={device.details.ram} label="RAM" size={100} />
          <CircularProgress value={device.details.disk_percent} label="Disk" size={100} />
        </div>
      ) : (
        <div className="text-center py-8">
          {device.status === 'online' ? (
            <p className="text-gray-500 text-sm">Agent not reachable</p>
          ) : (
            <div className="flex items-center justify-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">Device offline</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function SystemMonitor() {
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDevice, setNewDevice] = useState<{ ip: string, type: 'pc' | 'server', name: string }>({ ip: '', type: 'server', name: '' });

  const fetchData = useCallback(async () => {
    try {
      const [pcsRes, serversRes] = await Promise.all([
        axios.get<DeviceStatus[]>('/api/status/pcs'),
        axios.get<DeviceStatus[]>('/api/status/servers'),
      ]);
      setDevices([...pcsRes.data, ...serversRes.data]);
    } catch (error) {
      console.error("Failed to fetch device statuses", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const addDevice = async () => {
    if (newDevice.ip && newDevice.name) {
      try {
        await axios.post('/api/devices', { ip: newDevice.ip, type: `${newDevice.type}s`, name: newDevice.name });
        setNewDevice({ ip: '', type: 'server', name: '' });
        setShowAddForm(false);
        fetchData(); // Refresh data after adding
      } catch (error) {
        console.error("Failed to add device", error);
        if (axios.isAxiosError(error) && error.response) {
          alert(`Failed to add device: ${error.response.data.message}`);
        } else {
          alert('An unknown error occurred while adding the device.');
        }
      }
    }
  };

  const removeDevice = async (ip: string, type: 'pc' | 'server') => {
    try {
      await axios.delete(`/api/devices/${type}s/${ip}`);
      fetchData(); // Refresh data after removing
    } catch (error) {
      console.error("Failed to remove device", error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Failed to remove device: ${error.response.data.message}`);
      } else {
        alert('An unknown error occurred while removing the device.');
      }
    }
  };

  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.length - onlineCount;
  const monitoringCount = devices.filter(d => d.type === 'pc' && d.status === 'online').length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="container mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold">System Monitor</h1>
              </div>
              <p className="text-gray-400">Real-time device monitoring and ping status</p>
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
              Add Device
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700"><p className="text-gray-400 text-sm mb-1">Total Devices</p><p className="text-3xl font-bold">{devices.length}</p></div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700"><p className="text-gray-400 text-sm mb-1">Online</p><p className="text-3xl font-bold text-green-500">{onlineCount}</p></div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700"><p className="text-gray-400 text-sm mb-1">Offline</p><p className="text-3xl font-bold text-red-500">{offlineCount}</p></div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700"><p className="text-gray-400 text-sm mb-1">Monitoring</p><p className="text-3xl font-bold text-blue-500">{monitoringCount}</p></div>
        </div>

        {showAddForm && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <h3 className="text-xl font-semibold mb-4">Add New Device</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input type="text" placeholder="Device Name" value={newDevice.name} onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="IP Address" value={newDevice.ip} onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })} className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" />
              <select value={newDevice.type} onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value as 'pc' | 'server' })} className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                <option value="server">Server</option>
                <option value="pc">PC</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={addDevice} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors">Add Device</button>
              <button onClick={() => setShowAddForm(false)} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {devices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {devices.map(device => <DeviceCard key={device.ip} device={device} onRemove={removeDevice} />)}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
            <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No devices added yet</p>
            <p className="text-gray-500 text-sm mt-2">Click "Add Device" to start monitoring</p>
          </div>
        )}
      </div>
    </div>
  );
}
