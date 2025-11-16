/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpContext } from './context.js'
import type { JsonRpcResponse } from './response.js'

export interface Transport {
  bindBouncer?(mcpContext: McpContext): void
  bindAuth?(mcpContext: McpContext): void
  send(message: JsonRpcResponse): void
}
