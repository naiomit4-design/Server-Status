var $dmSvb$reactjsxruntime = require("react/jsx-runtime");
var $dmSvb$lucidereact = require("lucide-react");
var $dmSvb$recharts = require("recharts");




function $20a664a7d5fb9e32$var$SystemMonitor() {
    const [devices, setDevices] = React.useState([]);
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [newDevice, setNewDevice] = React.useState({
        name: '',
        ip: '',
        type: 'server'
    });
    const [historyData, setHistoryData] = React.useState({});
    const [selectedDevice, setSelectedDevice] = React.useState(null);
    // Simulate ping check
    const pingDevice = ()=>{
        return Math.random() > 0.1; // 90% uptime
    };
    // Initialize history for a device
    const initHistory = (deviceId)=>{
        const history = [];
        for(let i = 0; i < 20; i++)history.push({
            time: `${i}s`,
            cpu: Math.random() * 40 + 20,
            memory: Math.random() * 40 + 30,
            disk: Math.random() * 30 + 40
        });
        return history;
    };
    // Add device
    const addDevice = ()=>{
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
            setDevices([
                ...devices,
                device
            ]);
            setHistoryData({
                ...historyData,
                [device.id]: initHistory(device.id)
            });
            setNewDevice({
                name: '',
                ip: '',
                type: 'server'
            });
            setShowAddForm(false);
        }
    };
    // Real-time monitoring updates
    React.useEffect(()=>{
        const interval = setInterval(()=>{
            setDevices((prev)=>prev.map((device)=>({
                        ...device,
                        isOnline: pingDevice(),
                        cpu: Math.max(0, Math.min(100, device.cpu + (Math.random() - 0.5) * 15)),
                        memory: Math.max(0, Math.min(100, device.memory + (Math.random() - 0.5) * 12)),
                        disk: Math.max(0, Math.min(100, device.disk + (Math.random() - 0.5) * 5)),
                        lastPing: new Date().toLocaleTimeString()
                    })));
            // Update history
            setHistoryData((prev)=>{
                const updated = {
                    ...prev
                };
                devices.forEach((device)=>{
                    if (updated[device.id]) {
                        const newData = [
                            ...updated[device.id].slice(1),
                            {
                                time: new Date().toLocaleTimeString(),
                                cpu: device.cpu,
                                memory: device.memory,
                                disk: device.disk
                            }
                        ];
                        updated[device.id] = newData;
                    }
                });
                return updated;
            });
        }, 2000);
        return ()=>clearInterval(interval);
    }, [
        devices
    ]);
    const removeDevice = (id)=>{
        setDevices(devices.filter((d)=>d.id !== id));
        const newHistory = {
            ...historyData
        };
        delete newHistory[id];
        setHistoryData(newHistory);
        if (selectedDevice === id) setSelectedDevice(null);
    };
    const getDeviceIcon = (type)=>{
        switch(type){
            case 'server':
                return /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.Server), {
                    className: "w-6 h-6"
                });
            case 'pc':
                return /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.Monitor), {
                    className: "w-6 h-6"
                });
            case 'laptop':
                return /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.Laptop), {
                    className: "w-6 h-6"
                });
            case 'phone':
                return /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.Smartphone), {
                    className: "w-6 h-6"
                });
            default:
                return /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.Server), {
                    className: "w-6 h-6"
                });
        }
    };
    const getUsageColor = (value)=>{
        if (value > 80) return '#ef4444';
        if (value > 60) return '#f59e0b';
        return '#10b981';
    };
    const CircularProgress = ({ value: value, label: label, size: size = 120 })=>{
        const circumference = 2 * Math.PI * 45;
        const strokeDashoffset = circumference - value / 100 * circumference;
        const color = getUsageColor(value);
        return /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
            className: "flex flex-col items-center",
            children: [
                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                    className: "relative",
                    style: {
                        width: size,
                        height: size
                    },
                    children: [
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("svg", {
                            className: "transform -rotate-90",
                            width: size,
                            height: size,
                            children: [
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("circle", {
                                    cx: size / 2,
                                    cy: size / 2,
                                    r: "45",
                                    stroke: "#374151",
                                    strokeWidth: "8",
                                    fill: "none"
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("circle", {
                                    cx: size / 2,
                                    cy: size / 2,
                                    r: "45",
                                    stroke: color,
                                    strokeWidth: "8",
                                    fill: "none",
                                    strokeDasharray: circumference,
                                    strokeDashoffset: strokeDashoffset,
                                    strokeLinecap: "round",
                                    className: "transition-all duration-500"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("div", {
                            className: "absolute inset-0 flex flex-col items-center justify-center",
                            children: /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("span", {
                                className: "text-2xl font-bold text-white",
                                children: [
                                    value.toFixed(0),
                                    "%"
                                ]
                            })
                        })
                    ]
                }),
                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("span", {
                    className: "mt-2 text-sm text-gray-400 font-medium",
                    children: label
                })
            ]
        });
    };
    const DeviceCard = ({ device: device })=>{
        const showMonitoring = device.type !== 'server' && device.isOnline;
        return /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
            className: "bg-gray-800 rounded-lg p-4 border-2 border-gray-700 hover:border-gray-600 transition-all",
            children: [
                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                    className: "flex items-start justify-between mb-4",
                    children: [
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("div", {
                                    className: `${device.isOnline ? 'text-blue-400' : 'text-gray-600'}`,
                                    children: getDeviceIcon(device.type)
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("h3", {
                                            className: "font-semibold text-white",
                                            children: device.name
                                        }),
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                            className: "text-xs text-gray-400",
                                            children: device.ip
                                        }),
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                            className: "text-xs text-gray-500 capitalize",
                                            children: device.type
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                            className: "flex items-center gap-2",
                            children: [
                                device.isOnline ? /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.Wifi), {
                                    className: "w-5 h-5 text-green-500"
                                }) : /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.WifiOff), {
                                    className: "w-5 h-5 text-red-500"
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("button", {
                                    onClick: ()=>removeDevice(device.id),
                                    className: "p-1 hover:bg-gray-700 rounded transition-colors",
                                    children: /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.X), {
                                        className: "w-4 h-4 text-gray-400 hover:text-red-400"
                                    })
                                })
                            ]
                        })
                    ]
                }),
                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                    className: `inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${device.isOnline ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`,
                    children: [
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("div", {
                            className: `w-2 h-2 rounded-full ${device.isOnline ? 'bg-green-400' : 'bg-red-400'} animate-pulse`
                        }),
                        device.isOnline ? 'ONLINE' : 'OFFLINE'
                    ]
                }),
                showMonitoring ? /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                    children: [
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                            className: "grid grid-cols-3 gap-4 mb-6",
                            children: [
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)(CircularProgress, {
                                    value: device.cpu,
                                    label: "CPU",
                                    size: 100
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)(CircularProgress, {
                                    value: device.memory,
                                    label: "Memory",
                                    size: 100
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)(CircularProgress, {
                                    value: device.disk,
                                    label: "Disk",
                                    size: 100
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("button", {
                            onClick: ()=>setSelectedDevice(selectedDevice === device.id ? null : device.id),
                            className: "w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm font-medium",
                            children: selectedDevice === device.id ? 'Hide Charts' : 'View Frequency Charts'
                        })
                    ]
                }) : /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("div", {
                    className: "text-center py-8",
                    children: device.isOnline ? /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                        className: "text-gray-500 text-sm",
                        children: "Server monitoring - Ping only"
                    }) : /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                        className: "flex items-center justify-center gap-2 text-red-400",
                        children: [
                            /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.AlertCircle), {
                                className: "w-5 h-5"
                            }),
                            /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                className: "text-sm",
                                children: "Device offline"
                            })
                        ]
                    })
                }),
                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                    className: "mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500",
                    children: [
                        "Last ping: ",
                        device.lastPing
                    ]
                })
            ]
        });
    };
    const selectedDeviceData = selectedDevice ? devices.find((d)=>d.id === selectedDevice) : null;
    return /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("div", {
        className: "min-h-screen bg-gray-900 text-white p-4 sm:p-6",
        children: /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
            className: "container mx-auto",
            children: [
                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("div", {
                    className: "mb-8",
                    children: /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                                children: [
                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                                        className: "flex items-center gap-3 mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.Activity), {
                                                className: "w-8 h-8 text-blue-400"
                                            }),
                                            /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("h1", {
                                                className: "text-3xl font-bold",
                                                children: "System Monitor"
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                        className: "text-gray-400",
                                        children: "Real-time device monitoring and ping status"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("button", {
                                onClick: ()=>setShowAddForm(!showAddForm),
                                className: "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.Plus), {
                                        className: "w-5 h-5"
                                    }),
                                    "Add Device"
                                ]
                            })
                        ]
                    })
                }),
                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6",
                    children: [
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                            className: "bg-gray-800 rounded-lg p-4 border border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                    className: "text-gray-400 text-sm mb-1",
                                    children: "Total Devices"
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                    className: "text-3xl font-bold",
                                    children: devices.length
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                            className: "bg-gray-800 rounded-lg p-4 border border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                    className: "text-gray-400 text-sm mb-1",
                                    children: "Online"
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                    className: "text-3xl font-bold text-green-500",
                                    children: devices.filter((d)=>d.isOnline).length
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                            className: "bg-gray-800 rounded-lg p-4 border border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                    className: "text-gray-400 text-sm mb-1",
                                    children: "Offline"
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                    className: "text-3xl font-bold text-red-500",
                                    children: devices.filter((d)=>!d.isOnline).length
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                            className: "bg-gray-800 rounded-lg p-4 border border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                    className: "text-gray-400 text-sm mb-1",
                                    children: "Monitoring"
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                                    className: "text-3xl font-bold text-blue-500",
                                    children: devices.filter((d)=>d.type !== 'server' && d.isOnline).length
                                })
                            ]
                        })
                    ]
                }),
                showAddForm && /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                    className: "bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6",
                    children: [
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("h3", {
                            className: "text-xl font-semibold mb-4",
                            children: "Add New Device"
                        }),
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                            className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",
                            children: [
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("input", {
                                    type: "text",
                                    placeholder: "Device Name",
                                    value: newDevice.name,
                                    onChange: (e)=>setNewDevice({
                                            ...newDevice,
                                            name: e.target.value
                                        }),
                                    className: "bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("input", {
                                    type: "text",
                                    placeholder: "IP Address",
                                    value: newDevice.ip,
                                    onChange: (e)=>setNewDevice({
                                            ...newDevice,
                                            ip: e.target.value
                                        }),
                                    className: "bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("select", {
                                    value: newDevice.type,
                                    onChange: (e)=>setNewDevice({
                                            ...newDevice,
                                            type: e.target.value
                                        }),
                                    className: "bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500",
                                    children: [
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("option", {
                                            value: "server",
                                            children: "Server"
                                        }),
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("option", {
                                            value: "pc",
                                            children: "PC"
                                        }),
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("option", {
                                            value: "laptop",
                                            children: "Laptop"
                                        }),
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("option", {
                                            value: "phone",
                                            children: "Phone"
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                            className: "flex gap-3",
                            children: [
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("button", {
                                    onClick: addDevice,
                                    className: "bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors",
                                    children: "Add Device"
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("button", {
                                    onClick: ()=>setShowAddForm(false),
                                    className: "bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors",
                                    children: "Cancel"
                                })
                            ]
                        })
                    ]
                }),
                devices.length > 0 ? /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("div", {
                    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6",
                    children: devices.map((device)=>/*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)(DeviceCard, {
                            device: device
                        }, device.id))
                }) : /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                    className: "text-center py-16 bg-gray-800 rounded-lg border border-gray-700",
                    children: [
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.Server), {
                            className: "w-16 h-16 text-gray-600 mx-auto mb-4"
                        }),
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                            className: "text-gray-400 text-lg",
                            children: "No devices added yet"
                        }),
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("p", {
                            className: "text-gray-500 text-sm mt-2",
                            children: 'Click "Add Device" to start monitoring'
                        })
                    ]
                }),
                selectedDeviceData && historyData[selectedDevice] && /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                    className: "bg-gray-800 rounded-lg p-6 border-2 border-blue-500",
                    children: [
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                            className: "flex items-center justify-between mb-6",
                            children: [
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("h2", {
                                            className: "text-2xl font-bold text-white",
                                            children: "Frequency Distribution Charts"
                                        }),
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("p", {
                                            className: "text-gray-400",
                                            children: [
                                                selectedDeviceData.name,
                                                " - Real-time monitoring"
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("button", {
                                    onClick: ()=>setSelectedDevice(null),
                                    className: "p-2 hover:bg-gray-700 rounded-lg transition-colors",
                                    children: /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$lucidereact.X), {
                                        className: "w-6 h-6"
                                    })
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                            className: "grid grid-cols-1 gap-6",
                            children: [
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("h3", {
                                            className: "text-lg font-semibold mb-3 text-green-400",
                                            children: "CPU Usage Over Time"
                                        }),
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.ResponsiveContainer), {
                                            width: "100%",
                                            height: 200,
                                            children: /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)((0, $dmSvb$recharts.LineChart), {
                                                data: historyData[selectedDevice],
                                                children: [
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.CartesianGrid), {
                                                        strokeDasharray: "3 3",
                                                        stroke: "#374151"
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.XAxis), {
                                                        dataKey: "time",
                                                        stroke: "#9ca3af"
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.YAxis), {
                                                        stroke: "#9ca3af",
                                                        domain: [
                                                            0,
                                                            100
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.Tooltip), {
                                                        contentStyle: {
                                                            backgroundColor: '#1f2937',
                                                            border: '1px solid #374151'
                                                        },
                                                        labelStyle: {
                                                            color: '#fff'
                                                        }
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.Line), {
                                                        type: "monotone",
                                                        dataKey: "cpu",
                                                        stroke: "#10b981",
                                                        strokeWidth: 2,
                                                        dot: false
                                                    })
                                                ]
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("h3", {
                                            className: "text-lg font-semibold mb-3 text-blue-400",
                                            children: "Memory Usage Over Time"
                                        }),
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.ResponsiveContainer), {
                                            width: "100%",
                                            height: 200,
                                            children: /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)((0, $dmSvb$recharts.LineChart), {
                                                data: historyData[selectedDevice],
                                                children: [
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.CartesianGrid), {
                                                        strokeDasharray: "3 3",
                                                        stroke: "#374151"
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.XAxis), {
                                                        dataKey: "time",
                                                        stroke: "#9ca3af"
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.YAxis), {
                                                        stroke: "#9ca3af",
                                                        domain: [
                                                            0,
                                                            100
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.Tooltip), {
                                                        contentStyle: {
                                                            backgroundColor: '#1f2937',
                                                            border: '1px solid #374151'
                                                        },
                                                        labelStyle: {
                                                            color: '#fff'
                                                        }
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.Line), {
                                                        type: "monotone",
                                                        dataKey: "memory",
                                                        stroke: "#3b82f6",
                                                        strokeWidth: 2,
                                                        dot: false
                                                    })
                                                ]
                                            })
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)("h3", {
                                            className: "text-lg font-semibold mb-3 text-purple-400",
                                            children: "Disk Usage Over Time"
                                        }),
                                        /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.ResponsiveContainer), {
                                            width: "100%",
                                            height: 200,
                                            children: /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsxs)((0, $dmSvb$recharts.LineChart), {
                                                data: historyData[selectedDevice],
                                                children: [
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.CartesianGrid), {
                                                        strokeDasharray: "3 3",
                                                        stroke: "#374151"
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.XAxis), {
                                                        dataKey: "time",
                                                        stroke: "#9ca3af"
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.YAxis), {
                                                        stroke: "#9ca3af",
                                                        domain: [
                                                            0,
                                                            100
                                                        ]
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.Tooltip), {
                                                        contentStyle: {
                                                            backgroundColor: '#1f2937',
                                                            border: '1px solid #374151'
                                                        },
                                                        labelStyle: {
                                                            color: '#fff'
                                                        }
                                                    }),
                                                    /*#__PURE__*/ (0, $dmSvb$reactjsxruntime.jsx)((0, $dmSvb$recharts.Line), {
                                                        type: "monotone",
                                                        dataKey: "disk",
                                                        stroke: "#a855f7",
                                                        strokeWidth: 2,
                                                        dot: false
                                                    })
                                                ]
                                            })
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        })
    });
}
window.SystemMonitor = $20a664a7d5fb9e32$var$SystemMonitor;


//# sourceMappingURL=index.js.map
