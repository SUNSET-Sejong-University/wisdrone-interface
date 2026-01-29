import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import mapboxgl from 'mapbox-gl';
import type { IoTDevice } from '../types';

interface ThreeLayerProps {
  map: mapboxgl.Map | null;
  devices: IoTDevice[];
  onDeviceSelect?: (deviceId: string) => void;
}

export const useThreeLayer = ({ map, devices, onDeviceSelect }: ThreeLayerProps) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const deviceMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // Initialize Three.js layer once
  useEffect(() => {
    if (!map) return;
    if (map.getLayer('3d-model-layer')) return;

    // Model origin coordinates (map center)
    const modelOrigin: [number, number] = [127.0276, 37.4979];
    const modelAltitude = 0;
    const modelRotate = [Math.PI / 2, 0, 0];

    const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
      modelOrigin,
      modelAltitude
    );

    // Transformation parameters to position, rotate and scale the 3D model
    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z || 0,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
    };

    const customLayer: mapboxgl.CustomLayerInterface = {
      id: '3d-model-layer',
      type: 'custom',
      renderingMode: '3d',

      onAdd: function (map, gl) {
        console.log('✅ Three.js onAdd called');
        
        const camera = new THREE.Camera();
        const scene = new THREE.Scene();

        // Create lights
        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, -70, 100).normalize();
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff);
        directionalLight2.position.set(0, 70, 100).normalize();
        scene.add(directionalLight2);

        // Test cube removed - devices will be added dynamically

        console.log('✅ Scene initialized (test cube removed)');

        cameraRef.current = camera;
        sceneRef.current = scene;

        const renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true,
        });

        renderer.autoClear = false;
        rendererRef.current = renderer;
        
        console.log('✅ Renderer initialized');
      },

      render: function (gl, matrix) {
        const camera = cameraRef.current;
        const scene = sceneRef.current;
        const renderer = rendererRef.current;
        
        if (!camera || !scene || !renderer) return;

        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );

        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          )
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

        camera.projectionMatrix = m.multiply(l);
        renderer.resetState();
        renderer.render(scene, camera);
      },
    };

    map.addLayer(customLayer);
    console.log('✅ Layer added to map');
  }, [map]);

  // Handle click events for device selection
  useEffect(() => {
    if (!map || !onDeviceSelect) return;
    
    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (!sceneRef.current || !cameraRef.current) return;
        
      // Convert click to normalized device coordinates
      const mouse = new THREE.Vector2();
      mouse.x = (e.point.x / map.transform.width) * 2 - 1;
      mouse.y = -(e.point.y / map.transform.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      
      const meshes = Array.from(deviceMeshesRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const selectedMesh = intersects[0].object;
        const devId = selectedMesh.userData.deviceId;
        if (devId) {
          console.log('🎯 Device selected:', devId);
          onDeviceSelect(devId);
        }
      }
    };
    
    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [map, onDeviceSelect]);

  // Handle device meshes
  useEffect(() => {
    if (!sceneRef.current || !map || devices.length === 0) return;

    const scene = sceneRef.current;
    const meshes = deviceMeshesRef.current;

    // Remove deleted devices
    const currentDeviceIds = new Set(devices.map((d) => d.deviceId));
    meshes.forEach((mesh, id) => {
      if (!currentDeviceIds.has(id)) {
        scene.remove(mesh);
        meshes.delete(id);
      }
    });

    // Add or update devices
    devices.forEach((device) => {
      let mesh = meshes.get(device.deviceId);

      if (!mesh) {
        // Create mesh
        const geometry = device.type === 'DRONE'
          ? new THREE.BoxGeometry(50, 50, 50)
          : new THREE.ConeGeometry(30, 60, 8);

        const color = device.status === 'ACTIVE' ? 0x00ff9d
          : device.status === 'WARNING' ? 0xffb800 : 0x888888;

        const material = new THREE.MeshLambertMaterial({ color });

        mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { deviceId: device.deviceId };
        meshes.set(device.deviceId, mesh);
        scene.add(mesh);
        
        console.log('➕ Device mesh added:', device.deviceId);
      }

      // Position using device GPS coordinates
      const deviceMercator = mapboxgl.MercatorCoordinate.fromLngLat(
        [device.position.lng, device.position.lat],
        device.position.altitude
      );

      // Calculate position relative to model origin (Gangnam Station)
      const originMercator = mapboxgl.MercatorCoordinate.fromLngLat(
        [127.0276, 37.4979],
        0
      );

      // Convert to meters offset from origin
      const scale = originMercator.meterInMercatorCoordinateUnits();
      const xOffset = (deviceMercator.x - originMercator.x) / scale;
      const yOffset = (deviceMercator.y - originMercator.y) / scale;
      const zOffset = device.position.altitude;

      mesh.position.set(xOffset, yOffset, zOffset);
      
      console.log('📍 Device positioned:', device.deviceId, { x: xOffset, y: yOffset, z: zOffset });
    });

    map.triggerRepaint();
  }, [devices, map]);

  return { scene: sceneRef.current };
};
