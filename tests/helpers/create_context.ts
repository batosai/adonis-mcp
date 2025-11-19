/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

/**
 * Helper to create a test context for MCP methods
 */
import type { JsonRpcRequest } from '../../src/types/request.js'
import type { ServerContextOptions } from '../../src/types/context.js'
import ServerContext from '../../src/server/context.js'

export function createTestContext(
  jsonRpcRequest: JsonRpcRequest,
  overrides?: Partial<ServerContextOptions>
): ServerContext {
  const defaultOptions: ServerContextOptions = {
    supportedProtocolVersions: ['2025-06-18'],
    serverCapabilities: {
      tools: { listChanged: false },
      resources: { listChanged: false },
      prompts: { listChanged: false },
    },
    serverName: 'Test MCP Server',
    serverVersion: '1.0.0',
    instructions: 'Test instructions',
    maxPaginationLength: 50,
    defaultPaginationLength: 15,
    tools: {},
    resources: {},
    prompts: {},
    jsonRpcRequest,
    ...overrides,
  }

  return new ServerContext(defaultOptions)
}

