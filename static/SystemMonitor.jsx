import { Activity, Server, Monitor, Smartphone, Laptop, Plus, X, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SystemMonitor() {
  const [devices, setDevices] = React.useState([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newDevice, setNewDevice] = React.useState({ name: '', ip: '', type: 'server' });
  const [historyData, setHistoryData] = React.useState({});
  const [selectedDevice, setSelectedDevice] = React.useState(null);

  // Simulate ping check
  const pingDevice = () => {
    return Math.random() > 0.1; // 90% uptime
  };

  // Initialize history for a device
  const initHistory = (deviceId) => {
    const history = [];
    for (let i = 0; i < 20; i++) {
      history.push({
        time: `${i}s`,
        cpu: Math.random() * 40 + 20,
        memory: Math.random() * 40 + 30,
        disk: Math.random() * 30 + 40
      });
    }
    return history;
  };

  // Add device
  const addDevice = () => {
    if (newDevice.name && newDevice.ip) {
      const device = {
        id: Date.now(),
        name: newDevice.name,
        ip: newDevice.ip,
        type: newDevice.type,
        isOnline: pingDevice(),
        cpu: Math.random() * 60 + 20,
        memory: Math.random() * 60 + 20,
        disk: Math.random() * 60 + 20,
        lastPing: new Date().toLocaleTimeString()
      };
      setDevices([...devices, device]);
      setHistoryData({ ...historyData, [device.id]: initHistory(device.id) });
      setNewDevice({ name: '', ip: '', type: 'server' });
      setShowAddForm(false);
    }
  };

  // Real-time monitoring updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => prev.map(device => ({
        ...device,
        isOnline: pingDevice(),
        cpu: Math.max(0, Math.min(100, device.cpu + (Math.random() - 0.5) * 15)),
        memory: Math.max(0, Math.min(100, device.memory + (Math.random() - 0.5) * 12)),
        disk: Math.max(0, Math.min(100, device.disk + (Math.random() - 0.5) * 5)),
        lastPing: new Date().toLocaleTimeString()
      })));

      // Update history
      setHistoryData(prev => {
        const updated = { ...prev };
        devices.forEach(device => {
          if (updated[device.id]) {
            const newData = [...updated[device.id].slice(1), {
              time: new Date().toLocaleTimeString(),
              cpu: device.cpu,
              memory: device.memory,
              disk: device.disk
            }];
            updated[device.id] = newData;
          }
        });
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [devices]);

  const removeDevice = (id) => {
    setDevices(devices.filter(d => d.id !== id));
    const newHistory = { ...historyData };
    delete newHistory[id];
    setHistoryData(newHistory);
    if (selectedDevice === id) setSelectedDevice(null);
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'server': return <Server className="w-6 h-6" />;
      case 'pc': return <Monitor className="w-6 h-6" />;
      case 'laptop': return <Laptop className="w-6 h-6" />;
      case 'phone': return <Smartphone className="w-6 h-6" />;
      default: return <Server className="w-6 h-6" />;
    }
  };

  const getUsageColor = (value) => {
    if (value > 80) return '#ef4444';
    if (value > 60) return '#f59e0b';
    return '#10b981';
  };

  const CircularProgress = ({ value, label, size = 120 }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (value / 100) * circumference;
    const color = getUsageColor(value);

    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="transform -rotate-90" width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r="45"
              stroke="#374151"
              strokeWidth="8"
              fill="none"
            />
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

  const DeviceCard = ({ device }) => {
    const showMonitoring = device.type !== 'server' && device.isOnline;
    
    return (
      <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 hover:border-gray-600 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`${device.isOnline ? 'text-blue-400' : 'text-gray-600'}`}>
              {getDeviceIcon(device.type)}
            </div>
            <div>
              <h3 className="font-semibold text-white">{device.name}</h3>
              <p className="text-xs text-gray-400">{device.ip}</p>
              <p className="text-xs text-gray-500 capitalize">{device.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {device.isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <button
              onClick={() => removeDevice(device.id)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
          device.isOnline ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        }`}>
          <div className={`w-2 h-2 rounded-full ${device.isOnline ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          {device.isOnline ? 'ONLINE' : 'OFFLINE'}
        </div>

        {/* Show monitoring only for PC/Laptop/Phone when online */}
        {showMonitoring ? (
          <div>
            {/* Circular Progress Bars */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <CircularProgress value={device.cpu} label="CPU" size={100} />
              <CircularProgress value={device.memory} label="Memory" size={100} />
              <CircularProgress value={device.disk} label="Disk" size={100} />
            </div>

            {/* View Charts Button */}
            <button
              onClick={() => setSelectedDevice(selectedDevice === device.id ? null : device.id)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm font-medium"
            >
              {selectedDevice === device.id ? 'Hide Charts' : 'View Frequency Charts'}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            {device.isOnline ? (
              <p className="text-gray-500 text-sm">Server monitoring - Ping only</p>
            ) : (
              <div className="flex items-center justify-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">Device offline</p>
              </div>
            )}
          </div>
        )}

        {/* Last ping info */}
        <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
          Last ping: {device.lastPing}
        </div>
      </div>
    );
  };

  const selectedDeviceData = selectedDevice ? devices.find(d => d.id === selectedDevice) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold">System Monitor</h1>
              </div>
              <p className="text-gray-400">Real-time device monitoring and ping status</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Device
            </button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Devices</p>
            <p className="text-3xl font-bold">{devices.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Online</p>
            <p className="text-3xl font-bold text-green-500">{devices.filter(d => d.isOnline).length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Offline</p>
            <p className="text-3xl font-bold text-red-500">{devices.filter(d => !d.isOnline).length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Monitoring</p>
            <p className="text-3xl font-bold text-blue-500">
              {devices.filter(d => d.type !== 'server' && d.isOnline).length}
            </p>
          </div>
        </div>

        {/* Add Device Form */}
        {showAddForm && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <h3 className="text-xl font-semibold mb-4">Add New Device</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Device Name"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="IP Address"
                value={newDevice.ip}
                onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <select
                value={newDevice.type}
                onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="server">Server</option>
                <option value="pc">PC</option>
                <option value="laptop">Laptop</option>
                <option value="phone">Phone</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addDevice}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
              >
                Add Device
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Devices Grid */}
        {devices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {devices.map(device => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
            <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No devices added yet</p>
            <p className="text-gray-500 text-sm mt-2">Click "Add Device" to start monitoring</p>
          </div>
        )}

        {/* Frequency Distribution Charts */}
        {selectedDeviceData && historyData[selectedDevice] && (
          <div className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Frequency Distribution Charts</h2>
                <p className="text-gray-400">{selectedDeviceData.name} - Real-time monitoring</p>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* CPU Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400">CPU Usage Over Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={historyData[selectedDevice]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Memory Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">Memory Usage Over Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={historyData[selectedDevice]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="memory" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Disk Chart */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-400">Disk Usage Over Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={historyData[selectedDevice]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="disk" stroke="#a855f7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
window.SystemMonitor = SystemMonitor;