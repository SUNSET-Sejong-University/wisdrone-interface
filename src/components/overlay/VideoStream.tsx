import { useEffect, useRef, useState } from 'react';
import { StreamService } from '../../services/websocket';
import './VideoStream.css';

interface VideoStreamProps {
  streamUrl?: string;
  deviceName?: string;
}

export const VideoStream = ({ streamUrl, deviceName = 'Live Stream' }: VideoStreamProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const streamServiceRef = useRef<StreamService | null>(null);

  useEffect(() => {
    if (!streamUrl) return;

    const service = new StreamService(streamUrl);
    streamServiceRef.current = service;

    service.connect((blob) => {
      if (imgRef.current) {
        const url = URL.createObjectURL(blob);
        imgRef.current.src = url;
        
        // Clean up previous blob URL to prevent memory leak
        imgRef.current.onload = () => {
          URL.revokeObjectURL(url);
        };
      }
      setIsConnected(true);
    });

    return () => {
      service.disconnect();
      setIsConnected(false);
    };
  }, [streamUrl]);

  if (!streamUrl) {
    return (
      <div className="video-stream glass-panel">
        <div className="video-placeholder">
          <div className="placeholder-icon">📹</div>
          <p>No stream available</p>
          <small>Select a device to view live feed</small>
        </div>
      </div>
    );
  }

  return (
    <div className="video-stream glass-panel">
      <div className="stream-header">
        <div className="stream-title">
          <span className="stream-icon">🎥</span>
          {deviceName}
        </div>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {isConnected ? 'LIVE' : 'Connecting...'}
        </div>
      </div>
      <div className="stream-content">
        <img ref={imgRef} alt="Live stream" className="stream-image" />
      </div>
    </div>
  );
};
