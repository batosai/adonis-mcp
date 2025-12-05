/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ToolList, ResourceList, PromptList } from './method.js'
import type { McpRequest, McpRequestType } from './request.js'
import type { McpResourceResponse, McpToolResponse, McpPromptResponse } from './response.js'
import type { JsonRpcRequest } from './jsonrpc.js'

export interface McpContext {
  requestType: McpRequestType

  supportedProtocolVersions: string[]
  serverCapabilities: Record<string, any>
  serverName: string
  serverVersion: string
  instructions: string
  maxPaginationLength: number
  defaultPaginationLength: number
  tools: ToolList
  resources: ResourceList
  prompts: PromptList
  request: McpRequest
  response: this['requestType'] extends 'resource' 
  ? McpResourceResponse
  : this['requestType'] extends 'prompt'
  ? McpPromptResponse
  : McpToolResponse

  getPerPage(requestedPerPage?: number): number
}

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

export type ServerContextOptions = Omit<McpContext, 'requestType' | 'response' | 'request' | 'getPerPage'> & {
  jsonRpcRequest: JsonRpcRequest
}
