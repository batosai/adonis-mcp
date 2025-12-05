/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

export type JsonRpcRequest = {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: {
    cursor?: string
    [key: string]: unknown
  }
}

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

export type JsonRpcNotification = {
  jsonrpc: '2.0'
  method: string
  params?: {
    [key: string]: unknown
  }
}

// BUILDER TYPES

export type ErrorBuilder = {
  type: 'text'
  text: string
}

export type TextBuilder = {
  type: 'text'
  text: string
  _meta?: { [key: string]: unknown }
}

export type ImageBuilder = {
  type: 'image'
  data: string
  mimeType: string
  _meta?: { [key: string]: unknown }
}

export type AudioBuilder = {
  type: 'audio'
  data: string
  mimeType: string
  _meta?: { [key: string]: unknown }
}

export type BlobResourceBuilder = {
  blob: string
  mimeType?: string
  uri: string
  size?: number
  _meta?: { [key: string]: unknown }
}

export type TextResourceBuilder = {
  text: string
  mimeType?: string
  uri: string
  size?: number
  _meta?: { [key: string]: unknown }
}

export type ResourceBuilder = {
  type: 'resource'
  resource: BlobResourceBuilder | TextResourceBuilder
}