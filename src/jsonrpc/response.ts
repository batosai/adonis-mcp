/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JsonRpcResponse, JsonRpcResult, JsonRpcError } from '../types/jsonrpc.js'

export default class Response {
  #version = '2.0' as const
  #id: string | number
  #result?: JsonRpcResult
  #error?: JsonRpcError

  constructor(id: string | number) {
    this.#id = id
  }

  addResult(result: JsonRpcResult) {
    this.#result = result
  }

  addError(error: JsonRpcError) {
    this.#error = error
  }

  render(): JsonRpcResponse {
    return {
      jsonrpc: this.#version,
      id: this.#id,
      result: this.#result,
      error: this.#error,
    } as const
  }
}
