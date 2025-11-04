/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpConfig } from './types.js'
import type { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export default class Mcp {
  transports: { [sessionId: string]: StreamableHTTPServerTransport } = {}
  #server: McpServer
  config: McpConfig

  constructor(config: McpConfig) {
    this.config = config
    this.#server = new McpServer({
      name: 'adonis-mcp-server',
      version: '1.0.0',
      ...this.config.serverOptions,
    })
  }

  add(sessionId: string, transport: StreamableHTTPServerTransport) {
    this.transports[sessionId] = transport
  }

  delete(sessionId: string) {
    delete this.transports[sessionId]
  }

  get(sessionId: string) {
    return this.transports[sessionId]
  }

  getServer() {
    return this.#server
  }
}
