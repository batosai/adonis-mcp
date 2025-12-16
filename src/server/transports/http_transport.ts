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

  bindBouncer(mcpContext: McpContext) {
    if ('bouncer' in this.#ctx) {
      // @ts-ignore
      mcpContext.bouncer = this.#ctx.bouncer
    }
  }

  bindAuth(mcpContext: McpContext) {
    if ('auth' in this.#ctx) {
      // @ts-ignore
      mcpContext.auth = this.#ctx.auth
    }
  }

  send(message: JsonRpcResponse, sessionId?: string) {
    if (sessionId) {
      this.#ctx.response.safeHeader('MCP-Session-Id', sessionId)
    }

    this.#ctx.response.json(message)
  }
}
