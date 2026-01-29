import { useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../hooks/useMapbox';
import { useThreeLayer } from '../../hooks/useThreeLayer';
import { useHeatmap } from '../../hooks/useHeatmap';
import { useDevices } from '../../contexts/DeviceContext';
import './MapContainer.css';

// Mapbox token must be set before any map instantiation
const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
if (TOKEN) {
    mapboxgl.accessToken = TOKEN;
} else {
    console.error('Mapbox Token not found in environment variables!');
}

export const MapContainer = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { map, isMapLoaded } = useMapbox(mapContainerRef);
  const { devices, selectDevice } = useDevices();

  // Mock Heatmap Data (Default: Gangnam Station area)
  // This will be replaced by Mobius data later
  const heatmapData = useMemo(() => {
    const defaultLat = Number(import.meta.env.VITE_DEFAULT_LAT) || 37.4979;
    const defaultLng = Number(import.meta.env.VITE_DEFAULT_LNG) || 127.0276;
    
    // Generate some random hot spots around the default location
    return Array.from({ length: 20 }).map(() => ({
      lat: defaultLat + (Math.random() - 0.5) * 0.005,
      lng: defaultLng + (Math.random() - 0.5) * 0.005,
      intensity: Math.random(), // 0.0 to 1.0
    }));
  }, []);

  // Add Heatmap Layer
  useHeatmap({ map, data: heatmapData, visible: true });

  // Add Three.js layer for 3D device rendering
  useThreeLayer({ 
    map, 
    devices,
    onDeviceSelect: (deviceId) => {
      console.log('Selected device:', deviceId);
      selectDevice(deviceId);
    }
  });

  return (
    <div className="map-wrapper">
      <div ref={mapContainerRef} className="map-container" />
      {!isMapLoaded && (
        <div className="map-loading">
            Loading 3D Digital Twin...
        </div>
      )}
    </div>
  );
};
