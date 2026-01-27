import React from 'react';
import { useDroneStream } from '../../hooks/useDroneStream';

const DroneViewer: React.FC = () => {
  // 🔴 여기에 사용자님의 젯슨 IP를 입력하세요 (HTML에 있던 그 IP)
  const JETSON_IP = "172.19.25.66"; 
  
  const { imageSrc, isConnected } = useDroneStream(JETSON_IP, 3001);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#121212', // HTML 배경색
      padding: '20px',
      borderRadius: '10px',
      border: '2px solid #00ff00',
      boxShadow: '0 0 15px #00ff00',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        color: '#00ff00', 
        fontFamily: "'Courier New', monospace", 
        marginBottom: '10px' 
      }}>
        🚁 ESP32-CAM LIVE FEED
      </h2>

      {/* 상태 표시등 */}
      <div style={{
        fontSize: '1.2em',
        fontFamily: "'Courier New', monospace",
        color: isConnected ? '#00ff00' : 'red',
        marginBottom: '20px'
      }}>
        {isConnected ? "CONNECTED TO JETSON" : "Connecting to Jetson..."}
      </div>

      {/* 영상 출력 영역 */}
      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '5px',
        overflow: 'hidden',
        border: '1px solid #333'
      }}>
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt="Live Stream" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        ) : (
          <span style={{ color: '#555' }}>No Signal</span>
        )}
      </div>
    </div>
  );
};

export default DroneViewer;