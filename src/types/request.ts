/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

type McpRequestBase = {
  jsonrpc: '2.0'
  id: number | string
}

type InitializeRequest = McpRequestBase & {
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

type ToolsCallRequest = McpRequestBase & {
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