/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpRequestType } from '../../types/request.js'
import type { Completion } from '../../types/jsonrpc.js'
import type {
  Text,
  TextPrompt,
  Blob,
  Image,
  ImagePrompt,
  Audio,
  AudioPrompt,
  Structured,
  Error,
  ResourceLink as ResourceLinkContent,
  EmbeddedResource as EmbeddedResourceContent,
} from '../../types/content.js'

type TextResponseType<T extends McpRequestType> = T extends 'prompts/get' ? TextPrompt : Text
type ImageResponseType<T extends McpRequestType> = T extends 'prompts/get' ? ImagePrompt : Image
type AudioResponseType<T extends McpRequestType> = T extends 'prompts/get' ? AudioPrompt : Audio

export interface Response<T extends McpRequestType = McpRequestType> {
  readonly type: T
  text(text: string): TextResponseType<T>
  blob(text: string): Blob
  image(data: string, mimeType: string, _meta?: Record<string, unknown>): ImageResponseType<T>
  audio(data: string, mimeType: string, _meta?: Record<string, unknown>): AudioResponseType<T>
  structured(object: Record<string, unknown>): Structured
  resourceLink(uri: string): ResourceLinkContent
  embeddedResource(uri: string): EmbeddedResourceContent
  error(message?: string): Error
  complete(completion: Completion): Completion
}
