type MessageHandler = (data: any) => void;

class RealtimeWebSocketService {
  private socket: WebSocket | null = null;
  private listeners: MessageHandler[] = [];
  private reconnectTimeout: any = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    let wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) {
      const backendUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
      if (backendUrl) {
        const wsProto = backendUrl.startsWith('https:') ? 'wss:' : 'ws:';
        const cleanHost = backendUrl.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '').replace(/\/$/, '');
        wsUrl = `${wsProto}//${cleanHost}/ws/live`;
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${protocol}//${window.location.host}/ws/live`;
      }
    }

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log('⚡ Connected to NER-SAFE Live Telemetry Stream');
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.listeners.forEach(fn => fn(parsed));
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        // Attempt reconnect after 3 seconds
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
      };

      this.socket.onerror = () => {
        if (this.socket) {
          this.socket.close();
        }
      };
    } catch (err) {
      console.warn('WebSocket connection not reachable, will retry:', err);
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
    }
  }

  public subscribe(handler: MessageHandler): () => void {
    this.listeners.push(handler);
    return () => {
      this.listeners = this.listeners.filter(h => h !== handler);
    };
  }

  public send(action: string, payload?: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action, ...payload }));
    }
  }
}

export const wsService = new RealtimeWebSocketService();
