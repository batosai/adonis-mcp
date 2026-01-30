/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Response } from '../server/contracts/response.js'
import type {
  TextContent,
  ImageContent,
  AudioContent,
  StructuredContent,
  ErrorBuilder,
  BlobResourceContents,
  TextResourceContents,
  EmbeddedResource,
  ResourceLink,
} from './jsonrpc.js'

export type ToolResponse =
  | Promise<TextContent>
  | Promise<ImageContent>
  | Promise<AudioContent>
  | Promise<StructuredContent>
  | Promise<ResourceLink>
  | Promise<EmbeddedResource>
  | Promise<ErrorBuilder>

export type ResourceResponse = Promise<BlobResourceContents> | Promise<TextResourceContents>

export type PromptResponse =
  | Promise<TextContent>
  | Promise<ImageContent>
  | Promise<AudioContent>
  | Promise<ErrorBuilder>
  | Promise<EmbeddedResource>

export type McpToolResponse = Pick<
  Response<'tools/call'>,
  'text' | 'image' | 'audio' | 'structured' | 'resourceLink' | 'embeddedResource' | 'error'
>
export type McpResourceResponse = Pick<Response<'resources/read'>, 'text' | 'blob'>
export type McpPromptResponse = Pick<
  Response<'prompts/get'>,
  'text' | 'image' | 'audio' | 'embeddedResource' | 'error'
>
export type McpCompleteResponse = Pick<Response<'completion/complete'>, 'complete'>

type ResponseMap = {
  'tools/call': McpToolResponse
  'resources/read': McpResourceResponse
  'prompts/get': McpPromptResponse
  'completion/complete': McpCompleteResponse
}

export type McpResponse<T> = T extends keyof ResponseMap ? ResponseMap[T] : never
