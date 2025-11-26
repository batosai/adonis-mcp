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
  result?: JsonRpcResult
  error?: JsonRpcError
}

export type JsonRpcResult = {
  [key: string]: unknown
}

export type JsonRpcError = {
  code: number
  message: string
  data?: unknown
}

//

export type ErrorResponse = {
  type: 'text'
  text: string
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

export type ToolResponse = TextResponse | ImageResponse | AudioResponse | ErrorResponse
export type ResourceResponse = string | BlobResponse
export type PromptResponse = TextResponse | ImageResponse | AudioResponse
//
export interface McpResponse {

  readonly requestType: 'tool' | 'resource' | 'prompt'
  send(content: Content | Content[]): McpResponse

  text(text: string): McpResponse
  blob(text: string): McpResponse
  image(data: string, mimeType: string, _meta?: Record<string, unknown>): McpResponse
  audio(data: string, mimeType: string, _meta?: Record<string, unknown>): McpResponse
  error(message: string): McpResponse
}
