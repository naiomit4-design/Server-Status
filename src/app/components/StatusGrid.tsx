"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DeviceDetailsModal from './DeviceDetailsModal';

interface ServerStatus {
  ip: string;
  name: string;
  status: 'online' | 'offline';
  latency: string;
}

export default function StatusGrid() {
  const [servers, setServers] = useState<ServerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<ServerStatus | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get<ServerStatus[]>('/api/status/servers');
      setServers(res.data);
    } catch (error) {
      console.error("Failed to fetch server statuses", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSquareClick = (server: ServerStatus) => {
    if (server.status === 'online') {
      setSelectedServer(server);
    }
  };

  const closeModal = () => {
    setSelectedServer(null);
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading server statuses...</div>;
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
          {servers.map(server => (
            <div key={server.ip} className="relative group cursor-pointer" onClick={() => handleSquareClick(server)}>
              <div
                className={`w-full h-0 pb-[100%] rounded-sm flex items-center justify-center text-white text-xs text-center p-1 ${
                  server.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                  <span className="font-bold truncate">{server.name || server.ip}</span>
                  <span className="text-xs opacity-70">{server.ip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {servers.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400">No servers to display.</p>
          </div>
        )}
      </div>
      {selectedServer && (
        <DeviceDetailsModal ip={selectedServer.ip} onClose={closeModal} />
      )}
    </>
  );
}