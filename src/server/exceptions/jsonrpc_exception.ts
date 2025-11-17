import type { JsonRpcResponse } from '../../types/response.js'

import Response from '../../response.js'

export default class JsonRpcException extends Error {
  constructor(
    message: string,
    protected code: number,
    protected requestId: string | number,
    protected data?: Record<string, unknown>
  ) {

    super(message)
  }

  toJsonRpcResponse(): JsonRpcResponse {
    return Response.toJsonRpc({
      id: this.requestId,
      error: {
        code: this.code,
        message: this.message,
        data: this.data,
      },
    })
  }
}