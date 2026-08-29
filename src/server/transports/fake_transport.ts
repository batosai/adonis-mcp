/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Transport } from '../contracts/transport.js'
import type { McpContext } from '../../types/context.js'
import type { JsonRpcResponse } from '../../types/jsonrpc.js'
import type { TransportSendOptions } from '../contracts/transport.js'

export default class FakeTransport implements Transport {
  sentMessages: JsonRpcResponse[] = []
  sentOptions: (TransportSendOptions | undefined)[] = []
  bindBouncerCallbacks: ((ctx: McpContext) => void)[] = []
  bindAuthCallbacks: ((ctx: McpContext) => void)[] = []

  send(message: JsonRpcResponse, options?: TransportSendOptions): void {
    this.sentMessages.push(message)
    this.sentOptions.push(options)
  }

  async bindBouncer?(ctx: McpContext): Promise<void> {
    this.bindBouncerCallbacks.forEach((callback) => callback(ctx))
  }

  bindAuth?(ctx: McpContext): void {
    this.bindAuthCallbacks.forEach((callback) => callback(ctx))
  }

  clear(): void {
    this.sentMessages = []
    this.sentOptions = []
    this.bindBouncerCallbacks = []
    this.bindAuthCallbacks = []
  }

  getLastMessage(): JsonRpcResponse | undefined {
    return this.sentMessages[this.sentMessages.length - 1]
  }

  getLastOptions(): TransportSendOptions | undefined {
    return this.sentOptions[this.sentOptions.length - 1]
  }
}
