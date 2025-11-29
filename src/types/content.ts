/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

export type ErrorContent = {
  type: 'text'
  text: string
}

export type TextContent = {
  type: 'text'
  text: string
  _meta?: { [key: string]: unknown }
}

export type ImageContent = {
  type: 'image'
  data: string
  mimeType: string
  _meta?: { [key: string]: unknown }
}

export type AudioContent = {
  type: 'audio'
  data: string
  mimeType: string
  _meta?: { [key: string]: unknown }
}

export type BlobResourceContent = {
  blob: string
  mimeType?: string
  uri: string
  size?: number
  _meta?: { [key: string]: unknown }
}

export type TextResourceContent = {
  text: string
  mimeType?: string
  uri: string
  size?: number
  _meta?: { [key: string]: unknown }
}

export type ResourceContent = {
  type: 'resource'
  resource: BlobResourceContent | TextResourceContent
}