const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export class FraudWebSocket {
  constructor(onMessage) {
    this._onMessage = onMessage
    this._ws = null
    this._reconnectDelay = 2000
    this._stopped = false
  }

  connect() {
    if (this._stopped) return
    try {
      this._ws = new WebSocket(`${WS_URL}/ws/transactions`)
      this._ws.onmessage = e => {
        try { this._onMessage(JSON.parse(e.data)) } catch (_) {}
      }
      this._ws.onclose = () => {
        if (!this._stopped)
          setTimeout(() => this.connect(), this._reconnectDelay)
      }
      this._ws.onerror = () => this._ws.close()
    } catch (_) {}
  }

  disconnect() {
    this._stopped = true
    this._ws?.close()
  }
}
