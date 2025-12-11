/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpResourceResponse, McpToolResponse, McpPromptResponse } from './response.js'
import type { JsonRpcRequest } from './jsonrpc.js'
import type { McpContext } from '../server/contracts/context.js'
import type { InferJSONSchema, JSONSchema } from './method.js'

export type ToolContext<T extends JSONSchema = JSONSchema> = Omit<
  McpContext,
  'response' | 'requestType'
> & {
  requestType: 'tool'
  response: McpToolResponse
  args?: InferJSONSchema<T>
}

export type ResourceContext<T = {}> = Omit<McpContext, 'response' | 'requestType'> & {
  requestType: 'resource'
  response: McpResourceResponse
  args?: T
}

export type PromptContext<T extends JSONSchema = JSONSchema> = Omit<
  McpContext,
  'response' | 'requestType'
> & {
  requestType: 'prompt'
  response: McpPromptResponse
  args?: InferJSONSchema<T>
}

export type ServerContextOptions = Omit<
  McpContext,
  'requestType' | 'response' | 'request' | 'getPerPage' | 'getResources' | 'getResourceTemplates'
> & {
  jsonRpcRequest: JsonRpcRequest
}
