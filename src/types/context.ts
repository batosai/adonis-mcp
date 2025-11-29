/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ToolList, ResourceList, PromptList } from './method.js'
import type { McpRequest, JsonRpcRequest, McpRequestType } from './request.js'
import type { McpResourceResponse, McpToolResponse, McpPromptResponse } from './response.js'

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

export type ServerContextOptions = Omit<McpContext, 'requestType' | 'response' | 'request' | 'getPerPage'> & {
  jsonRpcRequest: JsonRpcRequest
}
