/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ToolList, ResourceList, PromptList } from './method.js'
import type { McpRequest, JsonRpcRequest } from './request.js'
import type { McpResponse } from './response.js'

export interface McpContext {
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
  response: McpResponse

  getPerPage(requestedPerPage?: number): number
}

export type ServerContextOptions = Omit<McpContext, 'response' | 'request' | 'getPerPage'> & {
  jsonRpcRequest: JsonRpcRequest
}
