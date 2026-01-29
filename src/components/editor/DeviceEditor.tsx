import { useState } from 'react';
import { useDevices } from '../../contexts/DeviceContext';
import type { IoTDevice } from '../../types';
import './DeviceEditor.css';

export const DeviceEditor = () => {
  const { addDevice, devices } = useDevices();
  const [deviceType, setDeviceType] = useState<'DRONE' | 'CCTV'>('DRONE');

  const handleAddDevice = () => {
    // For now, add device at default location (will integrate with map click later)
    const defaultLat = Number(import.meta.env.VITE_DEFAULT_LAT) || 37.4979;
    const defaultLng = Number(import.meta.env.VITE_DEFAULT_LNG) || 127.0276;

    const newDevice: IoTDevice = {
      deviceId: `${deviceType}-${Date.now()}`,
      type: deviceType,
      status: 'ACTIVE',
      position: {
        lat: defaultLat + (Math.random() - 0.5) * 0.01, // Random offset
        lng: defaultLng + (Math.random() - 0.5) * 0.01,
        altitude: deviceType === 'DRONE' ? 50 : 10,
      },
    };

    addDevice(newDevice);
  };

  return (
    <div className="device-editor glass-panel">
      <h2>IoT Device Manager</h2>

      <div className="device-controls">
        <div className="device-type-selector">
          <button
            className={`type-btn ${deviceType === 'DRONE' ? 'active' : ''}`}
            onClick={() => setDeviceType('DRONE')}
          >
            🚁 Drone
          </button>
          <button
            className={`type-btn ${deviceType === 'CCTV' ? 'active' : ''}`}
            onClick={() => setDeviceType('CCTV')}
          >
            📹 CCTV
          </button>
        </div>

        <button className="btn-primary add-device-btn" onClick={handleAddDevice}>
          + Add {deviceType}
        </button>
      </div>

      <div className="device-list">
        <h3>Active Devices ({devices.length})</h3>
        {devices.map((device) => (
          <div key={device.deviceId} className="device-item">
            <div className="device-icon">
              {device.type === 'DRONE' ? '🚁' : '📹'}
            </div>
            <div className="device-info">
              <div className="device-name">{device.deviceId}</div>
              <div className="device-position">
                {device.position.lat.toFixed(4)}, {device.position.lng.toFixed(4)}
              </div>
            </div>
            <div className={`device-status status-${device.status.toLowerCase()}`}>
              {device.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
