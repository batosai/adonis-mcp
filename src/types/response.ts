/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../server/content.js'
import type { McpRequestType } from './request.js'

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

// Helper types to simplify return types
export type ResponseType<T extends McpRequestType> = 
  T extends 'tool' ? McpToolResponse :
  T extends 'resource' ? McpResourceResponse :
  McpPromptResponse

export type MediaResponseType<T extends McpRequestType> = 
  T extends 'tool' ? McpToolResponse :
  T extends 'prompt' ? McpPromptResponse :
  never

export type TextResponseType<T extends McpRequestType> = 
  T extends 'tool' ? McpToolResponse : McpResourceResponse

export interface McpResponse<T extends McpRequestType = McpRequestType> {
  readonly type: T
  send(content: Content | Content[]): ResponseType<T>
  text(text: string): TextResponseType<T>
  blob(text: string): McpResourceResponse
  image(data: string, mimeType: string, _meta?: Record<string, unknown>): MediaResponseType<T>
  audio(data: string, mimeType: string, _meta?: Record<string, unknown>): MediaResponseType<T>
  error(message: string): McpToolResponse
}

export type McpToolResponse = Pick<McpResponse<'tool'>, 'send' | 'text' | 'image' | 'audio' | 'error'>
export type McpResourceResponse = Pick<McpResponse<'resource'>, 'text' | 'blob'>
export type McpPromptResponse = Pick<McpResponse<'prompt'>, 'send' | 'text' | 'image' | 'audio' | 'error'>