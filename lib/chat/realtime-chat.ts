import { ChatSettings, WebSocketMessage, WebSocketResponse } from "@/types"

interface RealtimeMessage {
  type: string
  text?: string
  error?: string
}

export class RealtimeChatHandler {
  private ws: WebSocket | null = null
  private messageCallback: (text: string) => void

  constructor(
    private apiKey: string,
    onMessage: (text: string) => void
  ) {
    this.messageCallback = onMessage
  }

  connect() {
    try {
      this.ws = new WebSocket("wss://api.openai.com/v1/realtime")

      // Add authorization headers
      this.ws.addEventListener("open", () => {
        this.ws?.send(
          JSON.stringify({
            type: "authorization",
            authorization: `Bearer ${this.apiKey}`,
            headers: {
              "OpenAI-Beta": "realtime=v1"
            }
          })
        )
      })

      this.ws.addEventListener("message", event => {
        try {
          const message = JSON.parse(event.data) as RealtimeMessage

          if (message.type === "content.text" && message.text) {
            this.messageCallback(message.text)
          }

          if (message.type === "error") {
            throw new Error(message.error || "Unknown realtime chat error")
          }
        } catch (error) {
          console.error("Error parsing message:", error)
        }
      })

      this.ws.addEventListener("error", error => {
        console.error("WebSocket error:", error)
      })
    } catch (error) {
      console.error("Failed to establish WebSocket connection:", error)
      throw error
    }
  }

  sendMessage(messages: any[], instructions: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected")
    }

    this.ws.send(
      JSON.stringify({
        type: "response.create",
        response: {
          modalities: ["text"],
          instructions,
          messages
        }
      })
    )
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }
}
