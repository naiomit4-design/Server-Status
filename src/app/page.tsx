import SystemMonitor from './components/SystemMonitor';
import StatusGrid from './components/StatusGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Server Status Dashboard</h1>
        <div className="mb-8">
          <StatusGrid />
        </div>
        <SystemMonitor />
      </div>
    </div>
  );
}
