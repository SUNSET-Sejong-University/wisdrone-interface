export interface IoTDevice {
  deviceId: string;
  type: 'CCTV' | 'DRONE';
  status: 'ACTIVE' | 'INACTIVE' | 'WARNING';
  position: {
    lat: number;
    lng: number;
    altitude: number;
  };
  streamUrl?: string;
}

export interface SensorDataContent {
  zoneId: string;
  densityLevel: 'SAFE' | 'CAUTION' | 'DANGER';
  crowdCount: number;
  riskScore: number;
  videoUrl: string;
  timestamp: string;
}
