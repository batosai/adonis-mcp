/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpContext } from '../../types/context.js'
import type { JsonRpcResponse } from '../../types/jsonrpc.js'

export interface Transport {
  bindBouncer?(mcpContext: McpContext): void
  bindAuth?(mcpContext: McpContext): void
  shield(method: string): void
  send(message: JsonRpcResponse, sessionId?: string): void
}
