/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */
import type { McpContext, ServerContextOptions } from '../types/context.js'
import type { ToolList, ResourceList, PromptList } from '../types/method.js'
import type { McpRequest } from '../types/request.js'

import Request from '../request.js'
import McpResponse from '../response.js'

export default class ServerContext implements McpContext {
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

  constructor(options: ServerContextOptions) {
    this.supportedProtocolVersions = options.supportedProtocolVersions
    this.serverCapabilities = options.serverCapabilities
    this.serverName = options.serverName
    this.serverVersion = options.serverVersion
    this.instructions = options.instructions
    this.maxPaginationLength = options.maxPaginationLength
    this.defaultPaginationLength = options.defaultPaginationLength
    this.tools = options.tools
    this.resources = options.resources
    this.prompts = options.prompts
    this.request = new Request(options.jsonRpcRequest) as McpRequest
    this.response = new McpResponse(options.jsonRpcRequest)
  }

  public getPerPage(requestedPerPage?: number): number {
    return Math.min(requestedPerPage ?? this.defaultPaginationLength, this.maxPaginationLength)
  }
}
