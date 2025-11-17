/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { McpContext } from '../../types/context.js'
import type { Transport } from '../../types/transport.js'
import type { JsonRpcResponse } from '../../types/response.js'

export default class HttpTransport implements Transport {
  constructor(protected ctx: HttpContext) {}

  bindBouncer(mcpContext: McpContext) {
    if ('bouncer' in this.ctx) {
      ;(mcpContext as any).bouncer = this.ctx.bouncer
    }
  }

  bindAuth(mcpContext: McpContext) {
    if ('auth' in this.ctx) {
      ;(mcpContext as any).auth = this.ctx.auth
    }
  }

  send(message: JsonRpcResponse) {
    this.ctx.response.json(message)
  }
}
