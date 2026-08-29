/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpContext } from '../../types/context.js'
import type { JsonRpcResponse } from '../../types/jsonrpc.js'
import type { JsonRpcRequest } from '../../types/jsonrpc.js'

export type TransportSendOptions = {
  status?: number
}

export interface Transport {
  bindBouncer?(mcpContext: McpContext): Promise<void>
  bindAuth?(mcpContext: McpContext): void
  validateRequest?(request: JsonRpcRequest, mcpContext: McpContext): void
  send(message: JsonRpcResponse, options?: TransportSendOptions): void
}
