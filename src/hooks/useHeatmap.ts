import { useEffect } from 'react';
import type mapboxgl from 'mapbox-gl';

interface HeatmapDataPoint {
  lat: number;
  lng: number;
  intensity: number; // 0.0 to 1.0
}

interface UseHeatmapProps {
  map: mapboxgl.Map | null;
  data: HeatmapDataPoint[]; 
  visible?: boolean;
}

export const useHeatmap = ({ map, data, visible = true }: UseHeatmapProps) => {
  useEffect(() => {
    if (!map) return;

    // Source ID and Layer ID
    const SOURCE_ID = 'heatmap-source';
    const LAYER_ID = 'heatmap-layer';

    // Convert data to GeoJSON
    const geoJsonData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: data.map((point) => ({
        type: 'Feature',
        properties: {
          intensity: point.intensity,
        },
        geometry: {
          type: 'Point',
          coordinates: [point.lng, point.lat], // GeoJSON is [lng, lat]
        },
      })),
    };

    // Add Source if not exists
    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: geoJsonData,
      });
    } else {
      // Update data
      (map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource).setData(geoJsonData);
    }

    // Add Layer if not exists
    if (!map.getLayer(LAYER_ID)) {
      map.addLayer(
        {
          id: LAYER_ID,
          type: 'heatmap',
          source: SOURCE_ID,
          maxzoom: 20, // Keep visible at high zoom for street level
          paint: {
            // Increase the heatmap weight based on frequency and property intensity
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              0, 0,
              1, 1,
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              15, 3, // Intense at street level
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Default configured for: Green -> Yellow -> Red
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 255, 0, 0)', // Transparent
              0.2, 'rgba(0, 255, 157, 0.4)', // Safe (Green)
              0.5, 'rgba(255, 184, 0, 0.6)', // Caution (Yellow)
              1.0, 'rgba(255, 0, 85, 0.8)', // Danger (Red)
            ],
            // Adjust the heatmap radius by zoom level
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,
              15, 30, // Larger radius at street level
            ],
            // Transition from heatmap to circle layer by zoom level
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14, 1,
              20, 0.6,
            ],
          },
        },
        'waterway-label' // Place before labels
      );
    }

    // Visibility toggle
    if (map.getLayer(LAYER_ID)) {
      map.setLayoutProperty(
        LAYER_ID,
        'visibility',
        visible ? 'visible' : 'none'
      );
    }

    return () => {
      // Cleanup handled by map removal usually, but can remove layer here if checking for unmount
    };
  }, [map, data, visible]);
};
