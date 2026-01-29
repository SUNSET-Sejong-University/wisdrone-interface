# 🚀 WisDrone AIoT Interface - Progress Report

## 📊 전체 진행률: **80%**

---

## ✅ 완료된 작업

### 1. 프로젝트 기초
- [x] 폴더 구조 및 의존성 설치
- [x] 환경 변수 설정 (.env)
- [x] TypeScript 타입 정의

### 2. 3D 지도 시스템
- [x] Mapbox GL JS 3D 건물 렌더링
- [x] Three.js Custom Layer 통합
- [x] 드론/CCTV 3D 모델 렌더링 (색상별 상태 표시)
- [x] **Heatmap Layer** (인파 밀집도 시각화)

### 3. IoT 장비 관리 & 인터랙션
- [x] DeviceContext (전역 상태 관리)
- [x] DeviceEditor UI (추가/편집/삭제)
- [x] **Raycasting 기반 3D 클릭 감지**
- [x] **장비 선택 시 카메라 스트림 자동 전환**
- [x] GPS 시뮬레이션 (1초마다 위치 변경)

### 4. 실시간 스트리밍
- [x] WebSocket 서비스
- [x] VideoStream 컴포넌트 (MJPEG)
- [x] 선택된 장비에 따른 동적 스트림 URL 전환

### 5. Mobius 4 연동(테스트는 필요)
- [x] oneM2M 표준 API (X-M2M-RVI: 4)
- [x] AE/CNT 자동 생성 및 중복 처리
- [x] 5초 폴링 기반 데이터 조회
- [x] 리소스 삭제 함수 (resetMobiusResources)

---

## 🔧 구현 완료, 미세조정 필요

### 1. 3D 렌더링 최적화
- **드론/CCTV 크기 조정**: 현재 고정 크기, 줌 레벨에 따라 동적으로 조정 필요
- **위치 정확도**: Origin 기준 상대 좌표 방식 개선 필요
- **클릭 영역 확대**: 현재 정확히 큐브를 클릭해야 함 → BoundingBox 확대 필요

### 2. 인터랙션 UX 개선
- **선택된 장비 강조**: 클릭한 드론에 외곽선(Outline) 또는 발광 효과 추가
- **Raycaster 정확도**: 카메라 각도에 따라 클릭 감지 정확도 개선
- **Hover 효과**: 마우스 오버 시 장비 이름 표시

### 3. 데이터 연동
- **GPS 시뮬레이션 → 실제 데이터**: 현재는 랜덤 이동, Mobius `drone_status` 컨테이너에서 실제 GPS 받아오기
- **Heatmap 실데이터**: 현재 Mock 데이터, Mobius `crowd_analysis` 데이터 연동 필요

### 4. 성능 최적화
- **Mesh 재사용**: 장비 위치 업데이트 시 매번 생성하지 않도록 개선
- **Throttling**: GPS 업데이트 주기 조정 (현재 1초 → 5초?)

---

## ⏳ 남은 구현 과제

### 1. 고급 시각화
- [ ] **3D Floating Labels**: 드론 위에 떠다니는 정보창 (배터리, 고도, 상태)
- [ ] **경로 시각화**: 드론 이동 경로를 선으로 표시
- [ ] **알림 애니메이션**: 위험 구역에 빨간색 깜빡임 효과

### 2. 실시간성 강화
- [ ] **MQTT Subscription**: 폴링 대신 실시간 푸시 방식으로 변경
- [ ] **WebSocket Reconnection**: 연결 끊김 시 자동 재연결

### 3. UI/UX 폴리싱
- [ ] **로딩 스피너**: 데이터 로딩 중 표시
- [ ] **에러 핸들링 UI**: Mobius 연결 실패 시 사용자 친화적 메시지
- [ ] **다크모드 토글**: 야간 모니터링용

### 4. 추가 기능
- [ ] **장비 필터링**: 상태별(ACTIVE/WARNING/OFFLINE) 필터
- [ ] **타임라인**: 과거 데이터 재생 기능
- [ ] **통계 대시보드**: 실시간 통계 차트

---

## 📝 기술 노트

### Three.js 렌더링 이슈 해결
- **문제**: Mercator 스케일 계산 오류로 드론이 렌더링되지 않음
- **해결**: Origin 기준 상대 좌표 방식 + Mapbox 공식 예제 패턴 적용
- **핵심**: `modelTransform`을 통한 좌표계 변환 및 `render()` 함수에서 projection matrix 적용

### Raycasting 구현
- **방식**: Three.js Raycaster + Normalized Device Coordinates (NDC)
- **주의사항**: Mapbox Custom Layer의 카메라는 표준 PerspectiveCamera가 아니므로 주의 필요

### Heatmap 설정 (Default)
| 항목 | 설정값 |
|-----|-------|
| Color Ramp | Green(Safe) → Yellow(Caution) → Red(Danger) |
| Radius | Zoom 레벨 비례 (Base 30px) |
| Intensity | 0.0 ~ 1.0 |

---

## ⚠️ 통신 관련 주의사항

### Mobius4 연동 시 필수 확인 사항

> [!WARNING]
> **`.env` 파일 설정이 Mobius4 서버 설정과 정확히 일치해야 합니다!**

#### 1. CSE 이름 (CSEBase Resource Name) 매칭
- **Mobius4 설정**: `config/default.json`의 `cse.csebase_rn` 값 확인
- **프론트엔드 설정**: `.env`의 `VITE_MOBIUS_CSE_NAME` 값과 **반드시 일치**
- **기본값**: `Mobius` (대소문자 구분!)

```json
// Mobius4 config/default.json
{
  "cse": {
    "cse_id": "/Mobius4",
    "csebase_rn": "Mobius"  // ← 이 값과 일치해야 함
  }
}
```

```bash
# .env 파일
VITE_MOBIUS_CSE_NAME=Mobius  # ← 위 값과 동일해야 함
```

#### 2. 포트 번호 확인
- **Mobius4 기본 포트**: `7599` (HTTP)
- **HTTPS 포트**: `7580`
- `.env`의 `VITE_MOBIUS_HOST`에 올바른 포트 지정 필수

#### 3. API 경로 구조
- **올바른 경로 형식**: `http://localhost:7599/Mobius/{AE_NAME}/{CONTAINER_NAME}`
- **잘못된 예시**: 
  - ❌ `/mobius` (소문자)
  - ❌ `/Mobius4` (CSE ID와 혼동)
  - ❌ 포트 누락

#### 4. oneM2M 헤더 필수 값
- `X-M2M-Origin`: AE 이름과 일치 (예: `WisDrone`)
- `X-M2M-RVI`: `4` (Mobius4 버전)
- `Content-Type`: `application/json;ty=3` (Container 생성 시)

#### 5. 자주 발생하는 오류
| 증상 | 원인 | 해결 방법 |
|-----|------|----------|
| `404 Not Found` | CSE 이름 불일치 | `.env`와 `config/default.json` 비교 |
| `CORS Error` | Mobius4 서버 미실행 | `node mobius4.js` 실행 확인 |
| `Connection Refused` | 포트 번호 오류 | 7599 포트 사용 확인 |
| `4103 (Originator has no privileges)` | Origin 헤더 오류 | AE 이름 확인 |

> [!IMPORTANT]
> **참고 자료**: [Mobius4 공식 레포지토리](https://github.com/IoTKETI/mobius4)  
> 설정 파일 예시: `config/default.json`

---

## 🎯 다음 단계 추천

1. **GPS 실데이터 연동** (즉시 적용 가능)
2. **선택된 드론 강조 표시** (UX 개선)
3. **드론 크기 동적 조정** (줌 레벨 반응형)
4. **3D Floating Labels** (정보 가독성 향상)
