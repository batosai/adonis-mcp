/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JsonRpcRequest } from './jsonrpc.js'
import type {
  McpResourceRequest,
  McpToolRequest,
  McpPromptRequest,
  McpCompleteRequest,
} from './request.js'
import type {
  McpResourceResponse,
  McpToolResponse,
  McpPromptResponse,
  McpCompleteResponse,
} from './response.js'
import type { Context } from '../server/contracts/context.js'
import type { InferJSONSchema, JSONSchema } from './method.js'

export interface McpContext extends Context {}

export type ToolContext<T extends JSONSchema = JSONSchema> = Omit<
  McpContext,
  'response' | 'requestMethod'
> & {
  requestMethod: 'tools/call'
  request: McpToolRequest
  response: McpToolResponse
  args?: InferJSONSchema<T>
}

export type ResourceContext<T = {}> = Omit<McpContext, 'response' | 'requestMethod'> & {
  requestMethod: 'resources/read'
  request: McpResourceRequest
  response: McpResourceResponse
  args?: T
}

export type PromptContext<T extends JSONSchema = JSONSchema> = Omit<
  McpContext,
  'response' | 'requestMethod'
> & {
  requestMethod: 'prompts/get'
  request: McpPromptRequest
  response: McpPromptResponse
  args?: InferJSONSchema<T>
}

export type CompleteContext<T = {}> = Omit<McpContext, 'response' | 'requestMethod'> & {
  requestMethod: 'completion/complete'
  request: McpCompleteRequest
  response: McpCompleteResponse
  args?: T
}

export type ServerContextOptions = Omit<
  McpContext,
  'requestMethod' | 'response' | 'request' | 'getPerPage'
> & {
  jsonRpcRequest: JsonRpcRequest
}
