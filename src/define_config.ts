/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpConfig } from './types/config.js'

export function defineConfig<T extends McpConfig>(config: T): T {
  return config
}
