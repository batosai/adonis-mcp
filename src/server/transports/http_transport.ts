/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { McpContext } from '../contracts/context.js'
import type { Transport } from '../contracts/transport.js'
import type { JsonRpcResponse } from '../../types/jsonrpc.js'

export default class HttpTransport implements Transport {
  #ctx: HttpContext
  constructor(ctx: HttpContext) {
    this.#ctx = ctx
  }

  bindBouncer(mcpContext: McpContext) {
    if ('bouncer' in this.#ctx) {
      ;(mcpContext as any).bouncer = this.#ctx.bouncer
    }
  }

  bindAuth(mcpContext: McpContext) {
    if ('auth' in this.#ctx) {
      ;(mcpContext as any).auth = this.#ctx.auth
    }
  }

  send(message: JsonRpcResponse) {
    this.#ctx.response.json(message)
  }
}
