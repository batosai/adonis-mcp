/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../server/content.js'

export type JsonRpcResponse = {
  jsonrpc: '2.0'
  id: string | number
  result?: {
    [key: string]: unknown
  }
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

export type ErrorResponse = {
  code: number
  message: string
  data?: unknown
}

export type TextResponse = {
  type: 'text'
  text: string
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

export type BlobResponse = {
  blob: string
}

export interface McpResponse {

  readonly requestType: 'tool' | 'resource' | 'prompt'
  send(content: Content | Content[]): 
    this['requestType'] extends 'resource' 
      ? string[] 
      : Array<TextResponse | ImageResponse | AudioResponse>

  text(text: string): 
    this['requestType'] extends 'resource' 
      ? string 
      : TextResponse

  blob(text: string): BlobResponse
  image(data: string, mimeType: string, _meta?: Record<string, unknown>): ImageResponse
  audio(data: string, mimeType: string, _meta?: Record<string, unknown>): AudioResponse
  error(message: string, code?: number, data?: Record<string, unknown>): ErrorResponse
}
