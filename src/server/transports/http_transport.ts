/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { Transport } from '../contracts/transport.js'
import type { McpContext } from '../../types/context.js'
import type { JsonRpcResponse } from '../../types/jsonrpc.js'
import type { JsonRpcRequest } from '../../types/jsonrpc.js'
import type { TransportSendOptions } from '../contracts/transport.js'

import { validateModernHttpHeaders } from '../protocols/http_headers.js'

export default class HttpTransport implements Transport {
  #ctx: HttpContext
  #sessionId?: string

  constructor(ctx: HttpContext) {
    this.#ctx = ctx
    this.#sessionId = ctx.request.header('MCP-Session-Id')
  }

  get sessionId() {
    return this.#sessionId
  }

  async bindBouncer(mcpContext: McpContext) {
    if ('bouncer' in this.#ctx) {
      const { default: McpBouncer } = await import('../mcp_bouncer.js')
      const bouncer = this.#ctx.bouncer as any
      ;(mcpContext as any).bouncer = new McpBouncer(bouncer, mcpContext.request.id)
    }
  }

  bindAuth(mcpContext: McpContext) {
    if ('auth' in this.#ctx) {
      ;(mcpContext as any).auth = this.#ctx.auth
    }
  }

  validateRequest(request: JsonRpcRequest, mcpContext: McpContext) {
    validateModernHttpHeaders(request, mcpContext, (name) => this.#ctx.request.header(name))
  }

  send(message: JsonRpcResponse, options?: TransportSendOptions) {
    if (options?.status) {
      this.#ctx.response.status(options.status)
    }
    this.#ctx.response.json(message)
  }
}
