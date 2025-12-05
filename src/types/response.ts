/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpRequestType } from './request.js'
import type {
  TextBuilder,
  ImageBuilder,
  AudioBuilder,
  ErrorBuilder,
  BlobResourceBuilder,
  TextResourceBuilder,
  ResourceBuilder,
} from './jsonrpc.js'
import type {
  Text,
  TextPrompt,
  Blob,
  Image,
  ImagePrompt,
  Audio,
  AudioPrompt,
  Error,
} from './content.js'

export type ToolResponse =
  | TextBuilder
  | ImageBuilder
  | AudioBuilder
  | ErrorBuilder
  | ResourceBuilder
export type ResourceResponse = BlobResourceBuilder | TextResourceBuilder
export type PromptResponse =
  | TextBuilder
  | ImageBuilder
  | AudioBuilder
  | ErrorBuilder
  | ResourceBuilder

type TextResponseType<T extends McpRequestType> = T extends 'prompt' ? TextPrompt : Text

type ImageResponseType<T extends McpRequestType> = T extends 'prompt' ? ImagePrompt : Image

type AudioResponseType<T extends McpRequestType> = T extends 'prompt' ? AudioPrompt : Audio

export interface McpResponse<T extends McpRequestType = McpRequestType> {
  readonly type: T
  text(text: string): TextResponseType<T>
  blob(text: string): Blob
  image(data: string, mimeType: string, _meta?: Record<string, unknown>): ImageResponseType<T>
  audio(data: string, mimeType: string, _meta?: Record<string, unknown>): AudioResponseType<T>
  error(message: string): Error
}

export type McpToolResponse = Pick<McpResponse<'tool'>, 'text' | 'image' | 'audio' | 'error'>
export type McpResourceResponse = Pick<McpResponse<'resource'>, 'text' | 'blob'>
export type McpPromptResponse = Pick<McpResponse<'prompt'>, 'text' | 'image' | 'audio' | 'error'>
