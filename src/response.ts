/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JsonRpcResponse, McpResponse } from './types/response.js'
import { ErrorCode } from './enums/error.js'
export default class Response implements McpResponse {

  text(text: string) {
    return { type: 'text' as const, text }
  }

  image(data: string, mimeType: string, _meta?: Record<string, unknown>) {
    return { type: 'image' as const, data, mimeType, _meta }
  }

  audio(data: string, mimeType: string, _meta?: Record<string, unknown>) {
    return { type: 'audio' as const, data, mimeType, _meta }
  }

  error(message: string, code?: number, data?: Record<string, unknown>) {
    return {
      message,
      code: code ?? ErrorCode.InternalError,
      data,
    }
  }

  static toJsonRpc({ id, result, error }: Omit<JsonRpcResponse, 'jsonrpc'> ): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      result,
      error,
    } as const
  }
}