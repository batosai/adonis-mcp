/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ToolList, ResourceList, PromptList } from '../../types/method.js'
import type { McpRequest, McpRequestType } from '../../types/request.js'
import type {
  McpResponse,
} from '../../types/response.js'

export interface Context {
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
  resourceTemplates?: string[]
  prompts: PromptList
  request: McpRequest<this['requestMethod']>
  response: McpResponse<this['requestMethod']>

  getPerPage(requestedPerPage?: number): number
  getResources(): Promise<ResourceList>
  getResourceTemplates(): Promise<ResourceList>
}
