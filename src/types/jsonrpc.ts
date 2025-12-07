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

// CONTENT TYPES

export type Role = 'user' | 'assistant'

export type ErrorBuilder = {
  type: 'text'
  text: string
}

export type TextContent = {
  type: 'text'
  text: string
  annotations?: Annotations
  _meta?: { [key: string]: unknown }
}

export type ImageContent = {
  type: 'image'
  data: string
  mimeType: string
  annotations?: Annotations
  _meta?: { [key: string]: unknown }
}

export type AudioContent = {
  type: 'audio'
  data: string
  mimeType: string
  annotations?: Annotations
  _meta?: { [key: string]: unknown }
}

export type StructuredContent = Record<string, unknown>

export type BlobResourceContents = {
  blob: string
  mimeType?: string
  uri: string
  _meta?: { [key: string]: unknown }
}

export type TextResourceContents = {
  text: string
  mimeType?: string
  uri: string
  _meta?: { [key: string]: unknown }
}

export type ResourceLink = {
  type: 'resource_link'
  name: string
  size?: number
  title?: string
  description?: string
  mimeType?: string
  uri: string
  annotations?: Annotations
  _meta?: { [key: string]: unknown }
}

export type EmbeddedResource = {
  type: 'resource'
  resource: BlobResourceContents | TextResourceContents
  annotations?: Annotations
  _meta?: { [key: string]: unknown }
}

export type Annotations = {
  audience?: Role[]
  lastModified?: string
  priority?: number
}

export type ContentBlock =
  | TextContent
  | ImageContent
  | AudioContent
  | EmbeddedResource
  | ResourceLink
