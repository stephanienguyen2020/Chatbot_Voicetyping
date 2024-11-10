export interface WebSocketMessage {
  type: WebSocketMessageType
  response?: WebSocketResponse
  text?: string
  error?: string
}

export type WebSocketMessageType =
  | "response.create"
  | "content.text"
  | "response.end"
  | "error"

export interface WebSocketResponse {
  modalities: string[]
  instructions: string
  messages: any[]
  temperature?: number
}
