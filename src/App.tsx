import { DeviceProvider, useDevices } from './contexts/DeviceContext';
import { MapContainer } from './components/map/MapContainer';
import { DeviceEditor } from './components/editor/DeviceEditor';
import { VideoStream } from './components/overlay/VideoStream';
import { DataPanel } from './components/overlay/DataPanel';
import './App.css';

function App() {
  // Get stream URL from env
  const gatewayUrl = import.meta.env.VITE_GATEWAY_WS_URL || '';
  
  // We need access to device context, but App is outside Provider in previous code
  // We need to move the logic inside a child component or move Provider up
  // Let's create an AppContent component to handle this cleanly
  
  return (
    <DeviceProvider>
      <AppContent gatewayUrl={gatewayUrl} />
    </DeviceProvider>
  );
}

const AppContent = ({ gatewayUrl }: { gatewayUrl: string }) => {
  const { selectedDevice, devices } = useDevices();
  
  // Determine active stream URL
  // If a device is selected and has a streamUrl, use it
  // Otherwise default to gateway stream or none
  const activeDevice = devices.find(d => d.deviceId === selectedDevice);
  const activeStreamUrl = activeDevice?.streamUrl || gatewayUrl;
  const activeStreamName = activeDevice ? `${activeDevice.type} ${activeDevice.deviceId}` : 'Gateway Stream';

  return (
    <div className="app-layout">
      <header className="app-header glass-panel">
        <h1>WisDrone AIoT Interface</h1>
        <div className="status-badges">
          <span className="badge badge-active">System Online</span>
        </div>
      </header>
      
      <main className="main-content">
        <MapContainer />
        
        {/* Data Panel (Mobius) */}
        <DataPanel />
        
        {/* Device Editor Panel */}
        <DeviceEditor />
        
        {/* Video Stream */}
        <VideoStream 
          streamUrl={activeStreamUrl} 
          deviceName={activeStreamName} 
        />
      </main>
    </div>
  );
};

export default App;
