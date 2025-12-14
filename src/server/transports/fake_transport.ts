/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Transport } from '../contracts/transport.js'
import type { McpContext } from '../../types/context.js'
import type { JsonRpcResponse } from '../../types/jsonrpc.js'

export default class FakeTransport implements Transport {
  sentMessages: JsonRpcResponse[] = []
  bindBouncerCallbacks: ((ctx: McpContext) => void)[] = []
  bindAuthCallbacks: ((ctx: McpContext) => void)[] = []

  send(message: JsonRpcResponse): void {
    this.sentMessages.push(message)
  }

  bindBouncer?(ctx: McpContext): void {
    this.bindBouncerCallbacks.forEach((callback) => callback(ctx))
  }

  bindAuth?(ctx: McpContext): void {
    this.bindAuthCallbacks.forEach((callback) => callback(ctx))
  }

  clear(): void {
    this.sentMessages = []
    this.bindBouncerCallbacks = []
    this.bindAuthCallbacks = []
  }

  getLastMessage(): JsonRpcResponse | undefined {
    return this.sentMessages[this.sentMessages.length - 1]
  }
}
