/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type {
  JsonRpcRequest,
  CallToolRequest,
  ReadResourceRequest,
  GetPromptRequest,
  CompleteRequest,
} from './jsonrpc.js'
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
  request: CallToolRequest
  response: McpToolResponse
  args?: InferJSONSchema<T>
}

export type ResourceContext<T = {}> = Omit<McpContext, 'response' | 'requestMethod'> & {
  requestMethod: 'resources/read'
  request: ReadResourceRequest
  response: McpResourceResponse
  args?: T
}

export type PromptContext<T extends JSONSchema = JSONSchema> = Omit<
  McpContext,
  'response' | 'requestMethod'
> & {
  requestMethod: 'prompts/get'
  request: GetPromptRequest
  response: McpPromptResponse
  args?: InferJSONSchema<T>
}

export type CompleteContext<T = {}> = Omit<McpContext, 'response' | 'requestMethod'> & {
  requestMethod: 'completion/complete'
  request: CompleteRequest
  response: McpCompleteResponse
  args?: T
}

export type ServerContextOptions = Omit<
  McpContext,
  'requestMethod' | 'response' | 'request' | 'getPerPage' | 'getResources' | 'getResourceTemplates'
> & {
  jsonRpcRequest: JsonRpcRequest
}
