/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { Bouncer } from '@adonisjs/bouncer'
import type { Transport } from '../contracts/transport.js'
import type { McpContext } from '../../types/context.js'
import type { JsonRpcResponse } from '../../types/jsonrpc.js'

import McpBouncer from '../mcp_bouncer.js'

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
      const bouncer = this.#ctx.bouncer as Bouncer<Record<any, any>>
      ;(mcpContext as any).bouncer = new McpBouncer(bouncer, mcpContext.request.id)
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
