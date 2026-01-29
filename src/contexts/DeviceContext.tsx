import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { IoTDevice } from '../types';

interface DeviceContextType {
  devices: IoTDevice[];
  selectedDevice: string | null;
  addDevice: (device: IoTDevice) => void;
  removeDevice: (deviceId: string) => void;
  updateDevice: (deviceId: string, updates: Partial<IoTDevice>) => void;
  selectDevice: (deviceId: string | null) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  // Simulate GPS updates (for testing real-time positioning)
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prevDevices) =>
        prevDevices.map((device) => {
          if (device.status !== 'ACTIVE') return device; // Only move active devices

          // Simulate small random movement (approx 1-2 meters)
          const latOffset = (Math.random() - 0.5) * 0.00002;
          const lngOffset = (Math.random() - 0.5) * 0.00002;
          const altOffset = (Math.random() - 0.5) * 0.5;

          return {
            ...device,
            position: {
              lat: device.position.lat + latOffset,
              lng: device.position.lng + lngOffset,
              altitude: Math.max(10, device.position.altitude + altOffset), // Min altitude 10m
            },
          };
        })
      );
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const addDevice = useCallback((device: IoTDevice) => {
    setDevices((prev) => [...prev, device]);
  }, []);

  const removeDevice = useCallback((deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
    if (selectedDevice === deviceId) {
      setSelectedDevice(null);
    }
  }, [selectedDevice]);

  const updateDevice = useCallback((deviceId: string, updates: Partial<IoTDevice>) => {
    setDevices((prev) =>
      prev.map((d) => (d.deviceId === deviceId ? { ...d, ...updates } : d))
    );
  }, []);

  const selectDevice = useCallback((deviceId: string | null) => {
    setSelectedDevice(deviceId);
  }, []);

  return (
    <DeviceContext.Provider
      value={{
        devices,
        selectedDevice,
        addDevice,
        removeDevice,
        updateDevice,
        selectDevice,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevices = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevices must be used within DeviceProvider');
  }
  return context;
};
