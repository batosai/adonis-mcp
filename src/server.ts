/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpConfig } from './types/config.js'
import type { McpRequest } from './types/request.js'
import type { ToolList, ResourceList, PromptList } from './types/method.js'
import type { Transport } from './types/transport.js'

import { createError } from '@adonisjs/core/exceptions'
import ServerContext from './context.js'

export default class Server {
  config: McpConfig
  name: string = 'AdonisJS MCP Server'
  version: string = '1.0.0'
  instructions: string = 'This MCP server lets AI agents interact with our AdonisJS application.'

  supportedProtocolVersion: string[] = ['2025-06-18']

  capabilities: Record<string, any> = {
    tools: {
      listChanged: false,
    },
    resources: {
      listChanged: false,
    },
    prompts: {
      listChanged: false,
    },
  }

  tools: ToolList = {}
  resources: ResourceList = {}
  prompts: PromptList = {}

  maxPaginationLength: number = 50
  defaultPaginationLength: number = 15

  methods = {
    'initialize': () => import('./server/methods/initialize.js'),
    'tools/list': () => import('./server/methods/list_tools.js'),
    'tools/call': () => import('./server/methods/call_tool.js'),
    'resources/list': () => import('./server/methods/list_resources.js'),
    'resources/read': () => import('./server/methods/read_resource.js'),
    'prompts/list': () => import('./server/methods/list_prompts.js'),
    'prompts/get': () => import('./server/methods/get_prompt.js'),
    'ping': () => import('./server/methods/ping.js'),
  }

  constructor(config: McpConfig) {
    this.config = config

    if (config.name) {
      this.name = config.name
    }

    if (config.version) {
      this.version = config.version
    }

    if (config.instructions) {
      this.instructions = config.instructions
    }

    if (config.maxPaginationLength) {
      this.maxPaginationLength = config.maxPaginationLength
    }

    if (config.defaultPaginationLength) {
      this.defaultPaginationLength = config.defaultPaginationLength
    }
  }

  addCapability(key: string, value: boolean = true) {
    if (key.includes('.')) {
      const [root, child] = key.split('.')
      let existing = this.capabilities[root] ?? {}

      existing[child] = value
      this.capabilities[root] = existing
    }
  }

  addTool(item: ToolList) {
    this.tools = { ...this.tools, ...item }
  }
  addResource(item: ResourceList) {
    this.resources = { ...this.resources, ...item }
  }
  addPrompt(item: PromptList) {
    this.prompts = { ...this.prompts, ...item }
  }

  async handle(jsonRequest: McpRequest, transport: Transport) {
    const mcpContext = this.createContext(jsonRequest)

    if (transport) {
      transport.bindBouncer(mcpContext)
      transport.bindAuth(mcpContext)
    }

    try {
      if (Object.keys(this.methods).includes(jsonRequest.method)) {
        const lazyMethod = this.methods[jsonRequest.method as keyof typeof this.methods]
        const { default: method } = await lazyMethod()
        const instance = new method()

        return instance.handle(mcpContext)
      } else {
        throw createError(
          `The method ${jsonRequest.method} was not found.`,
          'E_METHOD_NOT_FOUND',
          -32601
        )
      }
    } catch (e) {
      // TODO
    }
  }

  createContext(request: McpRequest) {
    return new ServerContext({
      supportedProtocolVersions: this.supportedProtocolVersion,
      serverCapabilities: this.capabilities,
      serverName: this.name,
      serverVersion: this.version,
      instructions: this.instructions,
      maxPaginationLength: this.maxPaginationLength,
      defaultPaginationLength: this.defaultPaginationLength,
      tools: this.tools,
      resources: this.resources,
      prompts: this.prompts,
      request,
    })
  }

  generateSessionId() {
    return crypto.randomUUID()
  }
}
