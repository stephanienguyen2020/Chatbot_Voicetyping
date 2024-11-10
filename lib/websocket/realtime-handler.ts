export class RealtimeWebSocket {
  private ws: WebSocket | null = null
  private encoder = new TextEncoder()

  constructor(
    private apiKey: string,
    private writable: WritableStreamDefaultWriter<Uint8Array>
  ) {}

  connect() {
    this.ws = new WebSocket("wss://api.openai.com/v1/realtime", {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "OpenAI-Beta": "realtime=v1"
      }
    })

    this.ws.onopen = this.handleOpen.bind(this)
    this.ws.onmessage = this.handleMessage.bind(this)
    this.ws.onerror = this.handleError.bind(this)
    this.ws.onclose = this.handleClose.bind(this)
  }

  async send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  private handleOpen() {
    console.log("WebSocket connected")
  }

  private async handleMessage(event: MessageEvent) {
    const message = JSON.parse(event.data)
    if (message.type === "content.text") {
      await this.writable.write(this.encoder.encode(message.text))
    }
    if (message.type === "response.end") {
      await this.writable.close()
    }
  }

  private async handleError(error: Event) {
    console.error("WebSocket error:", error)
    await this.writable.abort(new Error("WebSocket error"))
  }

  private handleClose() {
    console.log("WebSocket closed")
  }

  disconnect() {
    this.ws?.close()
  }
}
