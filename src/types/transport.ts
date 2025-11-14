/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpContext } from './context.js'

export interface Transport {
  bindBouncer(mcpContext: McpContext): void
  bindAuth(mcpContext: McpContext): void
}
