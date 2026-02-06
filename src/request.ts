/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */
import type { JsonRpcRequest } from './types/jsonrpc.js'
import type { Request } from './server/contracts/request.js'
import type { Context } from './server/contracts/context.js'

import Macroable from '@poppinss/macroable'

export default class McpRequest extends Macroable implements Request {
  ctx: Context
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: {
    cursor?: string
    [key: string]: unknown
  }

  constructor(ctx: Context, request: JsonRpcRequest) {
    super()
    this.ctx = ctx
    this.jsonrpc = request.jsonrpc
    this.id = request.id
    this.method = request.method
    this.params = request.params
  }
}
