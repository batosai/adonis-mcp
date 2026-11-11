/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Transport } from '../contracts/transport.js'
import type { JsonRpcResponse } from '../../types/jsonrpc.js'
import type { Readable, Writable } from 'node:stream'

import { ReadBuffer, serializeMessage } from '../../utils/stdio.js'
import { ErrorCode } from '../../enums/error.js'
import { EventEmitter } from 'node:events'

export default class StdioTransport extends EventEmitter implements Transport {
  #stdin: Readable = process.stdin
  #stdout: Writable = process.stdout
  #readBuffer: ReadBuffer = new ReadBuffer()

  ondata = (chunk: Buffer) => {
    this.#readBuffer.append(chunk)
    this.processReadBuffer()
  }

  constructor(stdin: Readable = process.stdin, stdout: Writable = process.stdout) {
    super()
    this.#stdin = stdin
    this.#stdout = stdout
    this.#stdin.on('data', this.ondata)
    this.#stdin.once('end', this.onend)
  }

  onend = () => {
    this.close()
    this.emit('mcp:stdio:transport:end')
  }

  close() {
    this.#stdin.removeListener('data', this.ondata)
    this.#stdin.removeListener('end', this.onend)
    this.#readBuffer.clear()
  }

  async processReadBuffer() {
    while (true) {
      let message
      try {
        message = this.#readBuffer.readMessage()
        if (message === undefined) {
          break
        }
      } catch {
        this.send({
          jsonrpc: '2.0',
          id: null,
          error: { code: ErrorCode.ParseError, message: 'Parse error' },
        })
        continue
      }
      this.emit('mcp:stdio:transport:message', message)
    }
  }

  send(message: JsonRpcResponse) {
    this.#stdout.write(serializeMessage(message))
  }
}
