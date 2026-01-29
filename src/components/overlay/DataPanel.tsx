import { useState } from 'react';
import { useMobius } from '../../hooks/useMobius';
import type { SensorDataContent } from '../../types';
import './DataPanel.css';

export const DataPanel = () => {
  const [containerName] = useState('crowd_analysis'); // Default container
  const { data, loading, error } = useMobius(containerName);

  const getRiskColor = (level: SensorDataContent['densityLevel']) => {
    switch (level) {
      case 'SAFE':
        return 'var(--success)';
      case 'CAUTION':
        return 'var(--warning)';
      case 'DANGER':
        return 'var(--danger)';
      default:
        return 'var(--text-dim)';
    }
  };

  return (
    <div className="data-panel glass-panel">
      <h2>실시간 인파 분석</h2>

      {loading && <div className="loading-indicator">데이터 로딩 중...</div>}
      
      {error && (
        <div className="error-message">
          ⚠️ Mobius 연결 실패
          <small>{error.message}</small>
        </div>
      )}

      {data && (
        <div className="data-content">
          <div className="data-row">
            <span className="data-label">구역 ID</span>
            <span className="data-value">{data.zoneId}</span>
          </div>

          <div className="data-row">
            <span className="data-label">밀집도</span>
            <span 
              className="data-value risk-level"
              style={{ color: getRiskColor(data.densityLevel) }}
            >
              {data.densityLevel}
            </span>
          </div>

          <div className="data-row">
            <span className="data-label">인원 수</span>
            <span className="data-value">{data.crowdCount}명</span>
          </div>

          <div className="data-row">
            <span className="data-label">위험도 점수</span>
            <span className="data-value">{(data.riskScore * 100).toFixed(1)}%</span>
          </div>

          <div className="data-row">
            <span className="data-label">업데이트</span>
            <span className="data-value timestamp">
              {new Date(data.timestamp).toLocaleTimeString('ko-KR')}
            </span>
          </div>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="no-data">
          데이터 대기 중...
        </div>
      )}
    </div>
  );
};
