/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpRequestType } from './request.js'
import type {
  TextContent,
  ImageContent,
  AudioContent,
  ErrorBuilder,
  BlobResourceContents,
  TextResourceContents,
  EmbeddedResource,
  ResourceLink,
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
  ResourceLink as ResourceLinkContent,
  EmbeddedResource as EmbeddedResourceContent,
} from './content.js'

export type ToolResponse =
  | Promise<TextContent>
  | Promise<ImageContent>
  | Promise<AudioContent>
  | Promise<ErrorBuilder>
  | Promise<ResourceLink>
  | Promise<EmbeddedResource>
export type ResourceResponse = Promise<BlobResourceContents> | Promise<TextResourceContents>
export type PromptResponse =
  | Promise<TextContent>
  | Promise<ImageContent>
  | Promise<AudioContent>
  | Promise<ErrorBuilder>
  | Promise<EmbeddedResource>

type TextResponseType<T extends McpRequestType> = T extends 'prompt' ? TextPrompt : Text

type ImageResponseType<T extends McpRequestType> = T extends 'prompt' ? ImagePrompt : Image

type AudioResponseType<T extends McpRequestType> = T extends 'prompt' ? AudioPrompt : Audio

export interface McpResponse<T extends McpRequestType = McpRequestType> {
  readonly type: T
  text(text: string): TextResponseType<T>
  blob(text: string): Blob
  image(data: string, mimeType: string, _meta?: Record<string, unknown>): ImageResponseType<T>
  audio(data: string, mimeType: string, _meta?: Record<string, unknown>): AudioResponseType<T>
  resourceLink(uri: string): ResourceLinkContent
  embeddedResource(uri: string): EmbeddedResourceContent
  error(message: string): Error
}

export type McpToolResponse = Pick<McpResponse<'tool'>, 'text' | 'image' | 'audio' | 'resourceLink' | 'embeddedResource' | 'error'>
export type McpResourceResponse = Pick<McpResponse<'resource'>, 'text' | 'blob'>
export type McpPromptResponse = Pick<McpResponse<'prompt'>, 'text' | 'image' | 'audio' | 'embeddedResource' | 'error'>
