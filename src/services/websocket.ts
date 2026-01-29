export class StreamService {
  private socket: WebSocket | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(onMessage: (data: Blob) => void) {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('Stream connected');
    };

    this.socket.onmessage = (event) => {
      onMessage(event.data);
    };

    this.socket.onerror = (error) => {
      console.error('Stream error:', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
