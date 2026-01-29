import axios from 'axios';
import type { SensorDataContent } from '../types';

// Mobius 4 Configuration
const MOBIUS_HOST = import.meta.env.VITE_MOBIUS_HOST || 'http://localhost:7599';
const CSE_NAME = import.meta.env.VITE_MOBIUS_CSE_NAME || 'Mobius';
const AE_NAME = import.meta.env.VITE_APP_AE_NAME || 'WisDrone';

// Store AEI after registration
let registeredAEI: string | null = null;

/**
 * Generate unique request ID
 */
const generateRI = () => `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

/**
 * Get base headers for Mobius 4 requests
 */
const getHeaders = (origin: string = 'S', resourceType?: number) => {
  const headers: Record<string, string> = {
    'X-M2M-RI': generateRI(),
    'X-M2M-Origin': origin,
    'X-M2M-RVI': '4',
    'Accept': 'application/json',
  };
  
  if (resourceType) {
    headers['Content-Type'] = `application/json;ty=${resourceType}`;
  }
  
  return headers;
};

/**
 * Create Application Entity (AE)
 */
export const createAE = async (aeName: string = AE_NAME): Promise<string> => {
  try {
    const response = await axios.post(
      `${MOBIUS_HOST}/${CSE_NAME}`,
      {
        'm2m:ae': {
          rn: aeName,
          api: `N.org.wisdrone.${aeName.toLowerCase()}`,
          rr: true,
        },
      },
      { headers: getHeaders('S', 2) }
    );
    
    const aei = response.data['m2m:ae'].aei;
    registeredAEI = aei;
    console.log(`✅ AE created: ${aeName} (AEI: ${aei})`);
    return aei;
  } catch (error: unknown) {
    // AE might already exist
    const err = error as { response?: { status: number } };
    if (err.response?.status === 409) {
      console.log(`⚠️ AE already exists: ${aeName}`);
      // Try to retrieve existing AE to get AEI
      const existing = await getResource(`/${CSE_NAME}/${aeName}`);
      const ae = existing['m2m:ae'] as { aei?: string; ri?: string } | undefined;
      registeredAEI = ae?.aei || ae?.ri || aeName;
      return registeredAEI;
    }
    throw error;
  }
};

/**
 * Create Container (CNT)
 */
export const createContainer = async (containerName: string): Promise<void> => {
  if (!registeredAEI) {
    throw new Error('AE not registered. Call createAE first.');
  }
  
  try {
    await axios.post(
      `${MOBIUS_HOST}/${CSE_NAME}/${AE_NAME}`,
      {
        'm2m:cnt': {
          rn: containerName,
        },
      },
      { headers: getHeaders(registeredAEI, 3) }
    );
    console.log(`✅ Container created: ${containerName}`);
  } catch (error: unknown) {
    const err = error as { response?: { status: number } };
    if (err.response?.status === 409) {
      console.log(`⚠️ Container already exists: ${containerName}`);
    } else {
      throw error;
    }
  }
};

/**
 * Create Content Instance (CIN)
 */
export const createContentInstance = async (
  containerName: string,
  data: SensorDataContent | Record<string, unknown>
): Promise<void> => {
  if (!registeredAEI) {
    throw new Error('AE not registered. Call createAE first.');
  }
  
  await axios.post(
    `${MOBIUS_HOST}/${CSE_NAME}/${AE_NAME}/${containerName}`,
    {
      'm2m:cin': {
        con: JSON.stringify(data),
      },
    },
    { headers: getHeaders(registeredAEI, 4) }
  );
};

/**
 * Get latest Content Instance from a Container
 */
export const getLatestData = async (containerName: string): Promise<SensorDataContent | null> => {
  if (!registeredAEI) {
    throw new Error('AE not registered. Call createAE first.');
  }
  
  try {
    const response = await axios.get(
      `${MOBIUS_HOST}/${CSE_NAME}/${AE_NAME}/${containerName}/la`,
      { headers: getHeaders(registeredAEI) }
    );
    
    const content = response.data['m2m:cin']?.con;
    if (content) {
      return typeof content === 'string' ? JSON.parse(content) : content;
    }
    return null;
  } catch (error: unknown) {
    const err = error as { response?: { status: number } };
    if (err.response?.status === 404) {
      return null; // No data yet
    }
    throw error;
  }
};

/**
 * Get any resource by path
 */
export const getResource = async (path: string): Promise<Record<string, unknown>> => {
  const response = await axios.get(
    `${MOBIUS_HOST}${path}`,
    { headers: getHeaders(registeredAEI || 'S') }
  );
  return response.data;
};

/**
 * Initialize Mobius resources
 * Call this on app startup to ensure AE and containers exist
 */
export const initializeMobius = async (): Promise<boolean> => {
  try {
    // Create or retrieve AE
    await createAE(AE_NAME);
    
    // Create containers
    await createContainer('crowd_analysis');
    await createContainer('drone_status');
    await createContainer('alerts');
    
    console.log('✅ Mobius resources initialized');
    return true;
  } catch (error) {
    console.error('❌ Mobius initialization failed:', error);
    return false;
  }
};

/**
 * Get AE ID (for external use)
 */
export const getAEI = (): string | null => registeredAEI;

/**
 * Delete a resource by path
 * Useful for cleanup/reset during development
 */
export const deleteResource = async (resourcePath: string): Promise<boolean> => {
  if (!registeredAEI) {
    console.warn('AE not registered, using admin origin');
  }
  
  try {
    await axios.delete(
      `${MOBIUS_HOST}/${CSE_NAME}${resourcePath}`,
      { headers: getHeaders(registeredAEI || 'S') }
    );
    console.log(`🗑️ Deleted: ${resourcePath}`);
    return true;
  } catch (error: unknown) {
    const err = error as { response?: { status: number } };
    if (err.response?.status === 404) {
      console.log(`⚠️ Resource not found: ${resourcePath}`);
      return false;
    }
    throw error;
  }
};

/**
 * Reset all WisDrone resources (for development)
 * WARNING: This deletes ALL data in the AE!
 */
export const resetMobiusResources = async (): Promise<void> => {
  try {
    await deleteResource(`/${AE_NAME}`);
    registeredAEI = null;
    console.log('🔄 Mobius resources reset. Call initializeMobius() to recreate.');
  } catch (error) {
    console.error('Reset failed:', error);
  }
};

// Export legacy function name for backwards compatibility
export const fetchLatestData = getLatestData;
