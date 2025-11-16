/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Transport } from '../types/transport.js'
import type { JsonRpcResponse } from '../types/response.js'
import type { Readable, Writable } from 'node:stream'

import { ReadBuffer, serializeMessage } from '../utils/stdio.js'
import { EventEmitter } from 'node:events'

export default class StdioTransport extends EventEmitter implements Transport {
  #stdin: Readable = process.stdin
  #stdout: Writable = process.stdout
  #readBuffer: ReadBuffer = new ReadBuffer()

  ondata = (chunk: Buffer) => {
      this.#readBuffer.append(chunk)
      this.processReadBuffer()
  }

  constructor() {
    super()
    this.#stdin.on('data', this.ondata)
  }

  // onerror = (error: Error) => {
  //     this.onerror?.(error)
  // }

  async processReadBuffer() {
    while (true) {
      try {
        const message = this.#readBuffer.readMessage()
        if (message === null) {
          break
        }

        this.emit('mcp:stdio:transport:message', message)
      } catch (error) {
        
      }
    }
  }

  send(message: JsonRpcResponse) {
    this.#stdout.write(serializeMessage(message))
  }
}
