/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JsonRpcRequest } from './jsonrpc.js'

// Base type for request types
export type McpRequestType = 'tool' | 'resource' | 'prompt'

type InitializeRequest = JsonRpcRequest & {
  method: 'initialize'
  params: {
    protocolVersion: string
    capabilities: {
      tools: boolean
      prompts: boolean
      resources: boolean
      logging: boolean
      elicitation: Record<string, unknown>
      roots: unknown
    }
    clientInfo: {
      name: string
      version: string
    }
  }
}

type ToolsCallRequest = JsonRpcRequest & {
  method: 'tools/call'
  params: {
    name: string
    arguments?: Record<string, unknown>
    _meta?: Record<string, unknown>
  }
}

type ResourcesReadRequest = JsonRpcRequest & {
  method: 'resources/read'
  params: {
    uri: string
  }
}

type GetPromptRequest = JsonRpcRequest & {
  method: 'prompts/get'
  params: { arguments?: { [key: string]: string }; name: string }
}

export type McpRequest = InitializeRequest | ToolsCallRequest | ResourcesReadRequest | GetPromptRequest