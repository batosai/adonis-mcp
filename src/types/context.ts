/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpResourceResponse, McpToolResponse, McpPromptResponse } from './response.js'
import type { JsonRpcRequest } from './jsonrpc.js'
import type { McpContext } from '../server/contracts/context.js'

export type ToolContext = Omit<McpContext, 'response' | 'requestType'> & {
  requestType: 'tool'
  response: McpToolResponse
}

export type ResourceContext = Omit<McpContext, 'response' | 'requestType'> & {
  requestType: 'resource'
  response: McpResourceResponse
}

export type PromptContext = Omit<McpContext, 'response' | 'requestType'> & {
  requestType: 'prompt'
  response: McpPromptResponse
}

export type ServerContextOptions = Omit<
  McpContext,
  'requestType' | 'response' | 'request' | 'getPerPage' | 'getResources' | 'getResourceTemplates'
> & {
  jsonRpcRequest: JsonRpcRequest
}
