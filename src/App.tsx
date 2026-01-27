import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import DroneViewer from './components/VideoPlayer/DroneViewer';
import DroneController from './components/Dashboard/DroneController';

function App() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white' }}>
      <h1>🚁 AIoT Drone GCS (Interface Prototype)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* 왼쪽: 영상 패널 */}
        <div>
           <DroneViewer/>
        </div>

        {/* 오른쪽: 지도 및 컨트롤러 영역 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 컨트롤러 패널 */}
        <DroneController />
        
        <div style={{ border: '2px dashed gray', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h3>3D Map Area</h3>
        </div>
      </div>

      </div>
    </div>
  );
}

export default App
