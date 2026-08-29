/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ToolList, ResourceList, PromptList } from '../../types/method.js'
import type { McpRequest, McpRequestType } from '../../types/request.js'
import type { McpResponse } from '../../types/response.js'
import type { ClientCapabilities, Implementation } from '../../types/jsonrpc.js'
import type { ProtocolEra } from '../protocols/version.js'

export interface Context {
  args?: Record<string, unknown>

  requestMethod: McpRequestType

  protocolEra: ProtocolEra
  protocolVersion?: string
  clientCapabilities?: ClientCapabilities
  clientInfo?: Implementation
  logLevel?: string

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
