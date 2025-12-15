/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */
import type { JsonRpcRequest } from './types/jsonrpc.js'

export default class Request implements JsonRpcRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: {
    cursor?: string
    [key: string]: unknown
  }

  constructor(request: JsonRpcRequest) {
    this.jsonrpc = request.jsonrpc
    this.id = request.id
    this.method = request.method
    this.params = request.params
  }
}
