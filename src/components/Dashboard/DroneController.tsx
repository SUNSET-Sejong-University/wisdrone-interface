import React, { useState, useCallback } from 'react';

interface ControllerValues {
  left: number;
  right: number;
}

const DroneController: React.FC = () => {
  // 기본값 1000
  const [values, setValues] = useState<ControllerValues>({ left: 1000, right: 1000 });

  const handleChange = useCallback((side: 'left' | 'right', value: string) => {
    const numValue = parseInt(value, 10);
    setValues(prev => {
      const newValues = { ...prev, [side]: numValue };
      // 🚀 통신 로직 (여기서 게이트웨이로 전송)
      //ex) sendToGateway(newValues.left, newValues.right);
      return newValues;
    });
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column', // 제목과 슬라이더 영역을 세로로 배치
      alignItems: 'center',
      gap: '20px',
      padding: '25px',
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '16px',
      border: '1px solid #444',
      width: 'fit-content', // 내용물에 맞춰 너비 자동 조절
      margin: '0 auto',
      color: 'white',
      fontFamily: 'monospace'
    }}>
      <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#00ff00' }}>
        🕹️ Manual Control
      </div>

      {/* 슬라이더들을 가로로 나란히 배치 */}
      <div style={{ display: 'flex', gap: '40px' }}>
        <VerticalSlider 
          label="L-Motor" 
          subLabel="(Throttle)"
          value={values.left} 
          onChange={(v) => handleChange('left', v)}
        />

        <VerticalSlider 
          label="R-Motor" 
          subLabel="(Pitch)"
          value={values.right} 
          onChange={(v) => handleChange('right', v)}
        />
      </div>
    </div>
  );
};

// 수직 슬라이더 컴포넌트
const VerticalSlider: React.FC<{
  label: string;
  subLabel: string;
  value: number;
  onChange: (val: string) => void;
}> = ({ label, subLabel, value, onChange }) => {
  // 색상 계산 (1000=초록 -> 2000=빨강)
  const percent = ((value - 1000) / 1000) * 100;
  const barColor = `hsl(${120 - (percent * 1.2)}, 100%, 50%)`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      {/* 라벨 영역 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', color: '#ccc' }}>{label}</span>
        <span style={{ fontSize: '0.8em', color: '#888' }}>{subLabel}</span>
      </div>

      {/* 현재 값 표시 배지 (슬라이더 위) */}
      <div style={{
        background: barColor,
        color: 'black',
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '0.9em',
        minWidth: '40px',
        textAlign: 'center'
      }}>
        {value}
      </div>

      {/* 수직 슬라이더 본체 */}
      <div style={{ height: '200px', display: 'flex', alignItems: 'center' }}>
        <input
          type="range"
          min="1000"
          max="2000"
          step="10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            // 브라우저 호환성을 위한 수직 설정
            
            WebkitAppearance: 'slider-vertical', /* Chrome/Safari/Edge */
            width: '8px',
            height: '100%', // 부모 높이(200px) 꽉 채움
            background: '#333',
            outline: 'none',
            cursor: 'pointer',
            accentColor: barColor
          }}
        />
      </div>
      
      {/* 눈금 표시 */}
      <div style={{ fontSize: '10px', color: '#666' }}>
        1000 ~ 2000
      </div>
    </div>
  );
};

export default DroneController;