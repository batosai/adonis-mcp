import type { JsonRpcResponse } from '../../types/jsonrpc.js'

import Response from '../../response.js'

export default class JsonRpcException extends Error {
  #code: number
  #requestId: string | number
  #data?: Record<string, unknown>

  constructor(
    message: string,
    code: number,
    requestId: string | number,
    data?: Record<string, unknown>
  ) {
    super(message)

    this.#code = code
    this.#requestId = requestId
    this.#data = data
  }

  get code(): number {
    return this.#code
  }

  get requestId(): string | number {
    return this.#requestId
  }

  get data(): Record<string, unknown> | undefined {
    return this.#data
  }

  toJsonRpcResponse(): JsonRpcResponse {
    return Response.toJsonRpc({
      id: this.#requestId,
      error: {
        code: this.#code,
        message: this.message,
        data: this.#data,
      },
    })
  }
}