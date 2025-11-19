/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

/**
 * Helper to create JSON-RPC requests for testing
 */
import type { JsonRpcRequest } from '../../src/types/request.js'

export function createJsonRpcRequest(
  method: string,
  params?: Record<string, unknown>,
  id: string | number = 1
): JsonRpcRequest {
  return {
    jsonrpc: '2.0',
    id,
    method,
    params,
  }
}

export function createInitializeRequest(
  protocolVersion: string = '2025-06-18',
  id: string | number = 1
): JsonRpcRequest {
  return createJsonRpcRequest(
    'initialize',
    {
      protocolVersion,
      capabilities: {
        tools: true,
        prompts: true,
        resources: true,
        logging: false,
        elicitation: {},
        roots: null,
      },
      clientInfo: {
        name: 'Test Client',
        version: '1.0.0',
      },
    },
    id
  )
}

export function createToolsCallRequest(
  name: string,
  args?: Record<string, unknown>,
  id: string | number = 1
): JsonRpcRequest {
  return createJsonRpcRequest(
    'tools/call',
    {
      name,
      arguments: args,
    },
    id
  )
}

export function createListToolsRequest(
  cursor?: string,
  id: string | number = 1
): JsonRpcRequest {
  return createJsonRpcRequest(
    'tools/list',
    cursor ? { cursor } : undefined,
    id
  )
}

