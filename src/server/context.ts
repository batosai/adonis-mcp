/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Context } from './contracts/context.js'
import type { McpResponse } from '../types/response.js'
import type { ServerContextOptions } from '../types/context.js'
import type { ToolList, ResourceList, PromptList } from '../types/method.js'
import type { McpRequest, McpRequestType } from '../types/request.js'

import Request from '../request.js'
import Response from '../response.js'
import { UriTemplate } from '../utils/uri_template.js'

export default class ServerContext implements Context {
  readonly requestMethod: McpRequestType

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
  request: McpRequest<this['requestMethod']>
  response: McpResponse<this['requestMethod']>

  constructor(options: ServerContextOptions) {
    this.requestMethod = options.jsonRpcRequest.method as McpRequestType

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

    this.request = new Request(options.jsonRpcRequest) as McpRequest<this['requestMethod']>
    this.response = new Response<this['requestMethod']>(
      options.jsonRpcRequest
    ) as unknown as McpResponse<this['requestMethod']>
  }

  getPerPage(requestedPerPage?: number): number {
    return Math.min(requestedPerPage ?? this.defaultPaginationLength, this.maxPaginationLength)
  }

  async getResources(): Promise<ResourceList> {
    return this.#filterResources({ includeTemplates: false })
  }

  async getResourceTemplates(): Promise<ResourceList> {
    return this.#filterResources({ includeTemplates: true })
  }

  async #filterResources({
    includeTemplates,
  }: {
    includeTemplates: boolean
  }): Promise<ResourceList> {
    const resourceEntries = Object.entries(this.resources)
    const filteredEntries = await Promise.all(
      resourceEntries.map(async ([key, resource]: [string, string]) => {
        const { default: Resource } = await import(resource)
        const resourceInstance = new Resource()
        const isTemplate = this.#isResourceTemplate(resourceInstance)
        return (includeTemplates ? isTemplate : !isTemplate) ? [key, resource] : null
      })
    )

    return Object.fromEntries(
      filteredEntries.filter((entry): entry is [string, string] => entry !== null)
    ) as ResourceList
  }

  #isResourceTemplate(resource: any): boolean {
    return UriTemplate.isTemplate(resource.uri)
  }
}
