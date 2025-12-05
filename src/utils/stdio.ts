/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JsonRpcRequest, JsonRpcResponse } from '../types/jsonrpc.js'

/**
 * Buffers a continuous stdio stream into discrete JSON-RPC messages.
 */
export class ReadBuffer {
  #buffer?: Buffer

  append(chunk: Buffer): void {
    this.#buffer = this.#buffer ? Buffer.concat([this.#buffer, chunk]) : chunk
  }

  readMessage(): JsonRpcRequest | null {
    if (!this.#buffer) {
      return null
    }

    const index = this.#buffer.indexOf('\n')
    if (index === -1) {
      return null
    }

    const line = this.#buffer.toString('utf8', 0, index).replace(/\r$/, '')
    this.#buffer = this.#buffer.subarray(index + 1)
    return deserializeMessage(line)
  }

  clear(): void {
    this.#buffer = undefined
  }
}

export function deserializeMessage(line: string): JsonRpcRequest | null {
  return JSON.parse(line)
}

export function serializeMessage(message: JsonRpcResponse): string {
  return JSON.stringify(message) + '\n'
}
