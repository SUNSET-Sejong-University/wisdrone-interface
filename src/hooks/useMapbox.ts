import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

// Note: Mapbox token should be set in .env or passed as a prop
// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export const useMapbox = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || map.current) return;

    if (!mapboxgl.accessToken) {
        console.warn('Mapbox Access Token is missing. Please set VITE_MAPBOX_TOKEN in .env');
    }

    map.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark mode style
      center: [
        Number(import.meta.env.VITE_DEFAULT_LNG) || 127.0276, 
        Number(import.meta.env.VITE_DEFAULT_LAT) || 37.4979
      ], 
      zoom: Number(import.meta.env.VITE_DEFAULT_ZOOM) || 15,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
      
      // Add 3D buildings layer
      if (!map.current) return;
      
      const layers = map.current.getStyle()?.layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      map.current.addLayer(
        {
          'id': 'add-3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });

    return () => {
        // Cleanup happens in the parent component mainly, but we could remove the map here if needed.
        // Usually creating the map once is fine.
    };
  }, [containerRef]);

  return { map: map.current, isMapLoaded };
};
