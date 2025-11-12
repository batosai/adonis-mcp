/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: string | number;
  result?: {
    [key: string]: unknown;
  }
  error?: {
    code: number;
    message: string;
    data?: unknown;
  }
}

export type ErrorResponse = {
  code: number;
  message: string;
  data?: unknown;
}

export type TextResponse = {
  type: 'text';
  text: string;
}

export type ImageResponse = {
  type: 'image'
  data: string
  mimeType: string
  _meta?: Record<string, unknown>
}

export type AudioResponse = {
  type: 'audio'
  data: string
  mimeType: string
  _meta?: Record<string, unknown>
}

export interface McpResponse {
  text(text: string): TextResponse
  image(data: string, mimeType: string, _meta?: Record<string, unknown>): ImageResponse
  audio(data: string, mimeType: string, _meta?: Record<string, unknown>): AudioResponse
  error(message: string, code?: number, data?: Record<string, unknown>): ErrorResponse
}