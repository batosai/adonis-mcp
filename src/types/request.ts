/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

export type JsonRpcRequest = {
  jsonrpc: "2.0"
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

export type McpRequest = 
  | InitializeRequest
  | ToolsCallRequest