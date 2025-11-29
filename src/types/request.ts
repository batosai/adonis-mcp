/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

// Base type for request types
export type McpRequestType = 'tool' | 'resource' | 'prompt'
export type JsonRpcRequestType = McpRequestType | 'system'

export type JsonRpcRequest = {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: {
    cursor?: string
    [key: string]: unknown
  }
}

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

export type McpRequest = InitializeRequest | ToolsCallRequest | ResourcesReadRequest
