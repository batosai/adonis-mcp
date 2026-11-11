/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpConfig } from './types/config.js'
import type { CacheScope } from './types/jsonrpc.js'
import type { JsonRpcRequest } from './types/jsonrpc.js'
import type {
  ToolList,
  ResourceList,
  PromptList,
  Method as MethodInterface,
} from './types/method.js'
import type { Transport } from './server/contracts/transport.js'
import type { LoggerService, EmitterService } from '@adonisjs/core/types'

import { createError } from '@adonisjs/core/exceptions'
import { ErrorCode } from './enums/error.js'
import ServerContext from './server/context.js'
import JsonRpcException from './server/exceptions/jsonrpc_exception.js'
import Response from './response.js'
import {
  LEGACY_PROTOCOL_VERSIONS,
  SUPPORTED_PROTOCOL_VERSIONS,
} from './server/protocols/version.js'

type Services = {
  logger: LoggerService
  emitter: EmitterService
}

type CacheHint = {
  ttlMs: number
  cacheScope: CacheScope
}

type CacheOperation = keyof NonNullable<McpConfig['cache']>

export default class Server {
  #logger?: LoggerService
  #emitter?: EmitterService
  #transport?: Transport

  config: McpConfig
  name: string = 'AdonisJS MCP Server'
  version: string = '1.0.0'
  instructions: string = 'This MCP server lets AI agents interact with our AdonisJS application.'

  supportedProtocolVersion: string[] = [...SUPPORTED_PROTOCOL_VERSIONS]
  supportedLegacyProtocolVersions: string[] = [...LEGACY_PROTOCOL_VERSIONS]

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
  resourceTemplates: ResourceList = {}
  prompts: PromptList = {}

  maxPaginationLength: number = 50
  defaultPaginationLength: number = 15

  cache: Record<CacheOperation, CacheHint>

  methods = {
    'server/discover': () => import('./server/methods/discover.js'),
    'initialize': () => import('./server/methods/initialize.js'),
    'tools/list': () => import('./server/methods/list_tools.js'),
    'tools/call': () => import('./server/methods/call_tool.js'),
    'resources/list': () => import('./server/methods/list_resources.js'),
    'resources/read': () => import('./server/methods/read_resource.js'),
    'resources/templates/list': () => import('./server/methods/list_resource_templates.js'),
    'prompts/list': () => import('./server/methods/list_prompts.js'),
    'prompts/get': () => import('./server/methods/get_prompt.js'),
    'completion/complete': () => import('./server/methods/completion.js'),
    'ping': () => import('./server/methods/ping.js'),
  }

  constructor(config: McpConfig, services?: Services) {
    this.config = config
    this.cache = {
      discover: this.resolveCacheHint(config.cache?.discover),
      tools: this.resolveCacheHint(config.cache?.tools),
      resources: this.resolveCacheHint(config.cache?.resources),
      resourceTemplates: this.resolveCacheHint(config.cache?.resourceTemplates),
      prompts: this.resolveCacheHint(config.cache?.prompts),
    }

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

    if (config.completions) {
      this.addCapability('completions')
    }

    this.#logger = services?.logger
    this.#emitter = services?.emitter
  }

  addCapability(key: string, value: boolean = true) {
    if (key.includes('.')) {
      const [root, child] = key.split('.')
      let existing = this.capabilities[root] ?? {}

      existing[child] = value
      this.capabilities[root] = existing

      return
    }

    this.capabilities[key] = {}
  }

  addTool(item: ToolList) {
    this.tools = { ...this.tools, ...item }
  }
  addResource(item: ResourceList) {
    this.resources = { ...this.resources, ...item }
  }
  addResourceTemplate(item: ResourceList) {
    this.resourceTemplates = { ...this.resourceTemplates, ...item }
  }
  addPrompt(item: PromptList) {
    this.prompts = { ...this.prompts, ...item }
  }

  /**
   * Sets the transport handle() falls back to when none is passed
   * per call.
   * @param transport - Transport to use as the default
   */
  async connect(transport: Transport) {
    this.#transport = transport
  }

  /**
   * Handles one JSON-RPC request and sends the response through a transport.
   * @param jsonRequest - The JSON-RPC request to handle
   * @param transport - Transport to send the response through. Omit it to use
   * whatever connect() last set (eg for stdio with one-client-per-process-lifetime
   * format). You MUST pass it when one Server instance might handle several requests at once
   * (e.g. shared behind an HTTP server), otherwise a second request's connect()
   * can redirect where an earlier request's response goes.
   */
  async handle(jsonRequest: JsonRpcRequest, transport?: Transport) {
    const activeTransport = transport ?? this.#transport

    if (!activeTransport) {
      throw createError('No transport connected.', 'E_NO_TRANSPORT_CONNECTED', 500)
    }

    if (
      !jsonRequest ||
      typeof jsonRequest !== 'object' ||
      Array.isArray(jsonRequest) ||
      jsonRequest.jsonrpc !== '2.0' ||
      typeof jsonRequest.method !== 'string' ||
      (jsonRequest.id !== undefined &&
        typeof jsonRequest.id !== 'string' &&
        !(typeof jsonRequest.id === 'number' && Number.isFinite(jsonRequest.id))) ||
      (jsonRequest.params !== undefined &&
        (!jsonRequest.params ||
          typeof jsonRequest.params !== 'object' ||
          Array.isArray(jsonRequest.params)))
    ) {
      return activeTransport.send(
        {
          jsonrpc: '2.0',
          id: null,
          error: { code: ErrorCode.InvalidRequest, message: 'Invalid request' },
        },
        { status: 400 }
      )
    }

    this.#emitter?.emit('mcp:request', jsonRequest)

    // Notifications do not receive responses.
    if (jsonRequest.id === undefined) {
      return null
    }

    try {
      const mcpContext = this.createContext(jsonRequest)
      await activeTransport.bindBouncer?.(mcpContext)
      activeTransport.bindAuth?.(mcpContext)
      activeTransport.validateRequest?.(jsonRequest, mcpContext)

      if (mcpContext.protocolEra === 'modern') {
        if (!this.supportedProtocolVersion.includes(mcpContext.protocolVersion!)) {
          throw new JsonRpcException(
            'Unsupported protocol version',
            ErrorCode.UnsupportedProtocolVersion,
            jsonRequest.id,
            {
              supported: this.supportedProtocolVersion,
              requested: mcpContext.protocolVersion,
            }
          )
        }

        if (!mcpContext.clientCapabilities) {
          throw new JsonRpcException(
            'Client capabilities are required',
            ErrorCode.InvalidParams,
            jsonRequest.id
          )
        }

        if (jsonRequest.method === 'initialize' || jsonRequest.method === 'ping') {
          throw new JsonRpcException(
            `The method ${jsonRequest.method} was not found.`,
            ErrorCode.MethodNotFound,
            jsonRequest.id
          )
        }
      } else if (jsonRequest.method === 'server/discover') {
        throw new JsonRpcException(
          `The method ${jsonRequest.method} was not found.`,
          ErrorCode.MethodNotFound,
          jsonRequest.id
        )
      }

      if (Object.keys(this.methods).includes(jsonRequest.method)) {
        const lazyMethod = this.methods[jsonRequest.method as keyof typeof this.methods]
        const { default: MethodClass } = await lazyMethod()
        // Cast the dynamically imported class to a constructor of the Method interface
        const instance = new (MethodClass as unknown as { new (...args: any[]): MethodInterface })()

        // Ensure the instance is treated as MethodInterface when calling handle to satisfy TS
        const methodResponse = await (instance as unknown as MethodInterface).handle(mcpContext)
        const response = Response.forProtocol(methodResponse, {
          era: mcpContext.protocolEra,
          serverName: mcpContext.serverName,
          serverVersion: mcpContext.serverVersion,
          cacheHint: this.getCacheHint(jsonRequest.method),
        })

        this.#emitter?.emit('mcp:response', response)
        activeTransport.send(response)
      } else {
        const jsonRpcException = new JsonRpcException(
          `The method ${jsonRequest.method} was not found.`,
          ErrorCode.MethodNotFound,
          jsonRequest.id
        )
        throw jsonRpcException
      }
    } catch (error: unknown) {
      let response
      if (error instanceof JsonRpcException) {
        response = error.toJsonRpcResponse()
        this.#logger?.error(response, error.message)
      } else {
        response = new JsonRpcException('Internal error', ErrorCode.InternalError, jsonRequest.id, {
          error: {
            name: (error as Error).name,
            message: (error as Error).message,
          },
        }).toJsonRpcResponse()
        this.#logger?.error(error)
      }

      this.#emitter?.emit('mcp:response', response)
      const status =
        error instanceof JsonRpcException &&
        [
          ErrorCode.HeaderMismatch,
          ErrorCode.MissingRequiredClientCapability,
          ErrorCode.UnsupportedProtocolVersion,
        ].includes(error.code)
          ? 400
          : undefined

      return activeTransport.send(response, { status })
    }
  }

  createContext(jsonRpcRequest: JsonRpcRequest) {
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
      resourceTemplates: this.resourceTemplates,
      prompts: this.prompts,
      jsonRpcRequest,
    })
  }

  private resolveCacheHint(config?: { ttlMs?: number; scope?: CacheScope }): CacheHint {
    return {
      ttlMs: config?.ttlMs ?? 0,
      cacheScope: config?.scope ?? 'private',
    }
  }

  private getCacheHint(method: string): CacheHint | undefined {
    const operations: Partial<Record<string, CacheOperation>> = {
      'server/discover': 'discover',
      'tools/list': 'tools',
      'resources/list': 'resources',
      'resources/read': 'resources',
      'resources/templates/list': 'resourceTemplates',
      'prompts/list': 'prompts',
    }
    const operation = operations[method]

    return operation ? this.cache[operation] : undefined
  }
}
