/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ToolList, ResourceList, PromptList } from '../../types/method.js'
import type { McpRequest, McpRequestType } from '../../types/request.js'
import type { McpResourceResponse, McpToolResponse, McpPromptResponse } from '../../types/response.js'

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
  resourceTemplates?: string[]
  prompts: PromptList
  request: McpRequest
  response: this['requestType'] extends 'resource'
    ? McpResourceResponse
    : this['requestType'] extends 'prompt'
      ? McpPromptResponse
      : McpToolResponse

  getPerPage(requestedPerPage?: number): number
  getResources(): Promise<ResourceList>
  getResourceTemplates(): Promise<ResourceList>
}