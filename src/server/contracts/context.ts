/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ToolList, ResourceList, PromptList } from '../../types/method.js'
import type { McpRequest, McpRequestType } from '../../types/request.js'
import type { McpResponse } from '../../types/response.js'

export interface Context {
  args?: Record<string, unknown>

  requestMethod: McpRequestType

  supportedProtocolVersions: string[]
  serverCapabilities: Record<string, any>
  serverName: string
  serverVersion: string
  instructions: string
  maxPaginationLength: number
  defaultPaginationLength: number
  tools: ToolList
  resources: ResourceList
  resourceTemplates: ResourceList
  prompts: PromptList
  request: McpRequest<this['requestMethod']>
  response: McpResponse<this['requestMethod']>

  getPerPage(requestedPerPage?: number): number
}
