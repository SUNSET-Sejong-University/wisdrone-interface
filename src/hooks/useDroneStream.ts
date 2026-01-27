import { useEffect, useState, useRef } from 'react';



export const useDroneStream = (ipAddress: string, port: number = 3001) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. WebSocket 주소 설정
    const url = `ws://${ipAddress}:${port}`;
    console.log(`Connecting to Jetson at ${url}...`);

    ws.current = new WebSocket(url);
    
    // 중요: 바이너리 데이터를 Blob 형태로 받겠다고 선언
    ws.current.binaryType = 'blob'; 

    // 2. 연결 성공 시 핸드셰이크 ("BROWSER" 전송)
    ws.current.onopen = () => {
      console.log('✅ Connected to Jetson');
      setIsConnected(true);
      
      // [핵심] 젯슨 Python 서버가 요구하는 인증 메시지 전송
      ws.current?.send("BROWSER");
    };

    // 3. 메시지 수신 (이미지 데이터)
    ws.current.onmessage = (event) => {
      // 들어온 데이터가 Blob(이미지)인지 확인
      if (event.data instanceof Blob) {
        const newUrl = URL.createObjectURL(event.data);

        // 이전 이미지 URL 메모리 해제 후 새 이미지로 교체
        setImageSrc((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl); // 메모리 청소
          return newUrl;
        });
      }
    };

    ws.current.onclose = () => {
      console.log('❌ Disconnected from Jetson');
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('⚠️ WebSocket Error:', error);
      setIsConnected(false);
    };

    // 4. 컴포넌트가 사라질 때 정리 (Cleanup)
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [ipAddress, port]);

  return { imageSrc, isConnected };
};