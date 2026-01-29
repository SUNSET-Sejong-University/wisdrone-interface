# Mobius 4 연동 가이드

## 📋 리소스 구조 (Resource Tree)

```
Mobius (CSE - Common Service Entity)
└── WisDrone (AE - Application Entity)
    ├── crowd_analysis (CNT)  ← 인파 분석 결과
    │   └── cin_xxx (CIN)     ← { densityLevel, crowdCount, riskScore, ... }
    ├── drone_status (CNT)    ← 드론 상태 정보
    │   └── cin_xxx (CIN)     ← { deviceId, lat, lng, altitude, battery, ... }
    └── alerts (CNT)          ← 경고 알림
        └── cin_xxx (CIN)     ← { type, message, severity, ... }
```

---

## 🔧 환경 변수 (.env)

```env
VITE_MOBIUS_HOST=http://localhost:7599
VITE_MOBIUS_CSE_NAME=Mobius
VITE_APP_AE_NAME=WisDrone
```

---

## 🧪 테스트용 Curl 명령어

### 1. AE 생성
```bash
curl -i -X POST "http://localhost:7599/Mobius" \
  -H "X-M2M-RI: req001" \
  -H "X-M2M-Origin: S" \
  -H "X-M2M-RVI: 4" \
  -H "Content-Type: application/json;ty=2" \
  -d '{
    "m2m:ae": {
      "rn": "WisDrone",
      "api": "N.org.wisdrone.wisdrone",
      "rr": true
    }
  }'
```

### 2. Container 생성 (AEI 사용)
```bash
# crowd_analysis 컨테이너
curl -i -X POST "http://localhost:7599/Mobius/WisDrone" \
  -H "X-M2M-RI: req002" \
  -H "X-M2M-Origin: <AEI>" \
  -H "X-M2M-RVI: 4" \
  -H "Content-Type: application/json;ty=3" \
  -d '{"m2m:cnt": {"rn": "crowd_analysis"}}'
```

### 3. Content Instance 생성
```bash
curl -i -X POST "http://localhost:7599/Mobius/WisDrone/crowd_analysis" \
  -H "X-M2M-RI: req003" \
  -H "X-M2M-Origin: <AEI>" \
  -H "X-M2M-RVI: 4" \
  -H "Content-Type: application/json;ty=4" \
  -d '{
    "m2m:cin": {
      "con": "{\"zoneId\":\"zone_001\",\"densityLevel\":\"CAUTION\",\"crowdCount\":150,\"riskScore\":0.65,\"timestamp\":\"2026-01-29T19:00:00+09:00\"}"
    }
  }'
```

### 4. 최신 데이터 조회
```bash
curl -i -X GET "http://localhost:7599/Mobius/WisDrone/crowd_analysis/la" \
  -H "X-M2M-RI: req004" \
  -H "X-M2M-Origin: <AEI>" \
  -H "X-M2M-RVI: 4" \
  -H "Accept: application/json"
```

---

## 📡 프론트엔드 사용법

```typescript
import { useMobius } from './hooks/useMobius';

function MyComponent() {
  // 자동으로 AE/CNT 초기화 후 5초 간격 폴링
  const { data, loading, error, isInitialized } = useMobius('crowd_analysis');

  if (!isInitialized) return <div>Mobius 연결 중...</div>;
  if (loading) return <div>데이터 로딩...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return (
    <div>
      <p>밀집도: {data?.densityLevel}</p>
      <p>인원수: {data?.crowdCount}명</p>
    </div>
  );
}
```

---

## 🔄 향후 Subscription 구현 (MQTT)

Mobius 4는 MQTT 기반 구독도 지원합니다. 추후 실시간성이 중요해지면:

```typescript
// subscription 생성 예시 (서버 사이드 필요)
const createSubscription = async (containerPath: string, notificationUri: string) => {
  await axios.post(`${MOBIUS_HOST}${containerPath}`, {
    'm2m:sub': {
      rn: 'sub_crowd',
      nu: [notificationUri],  // 알림 받을 URI
      nct: 1,                 // 알림 조건 (1=변경 시)
    }
  }, { headers: getHeaders(registeredAEI, 23) });  // ty=23 for subscription
};
```
