/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpConfig } from './types.js'

export function defineConfig<T extends McpConfig>(config: T): T {
  if (!config.path) {
    config.path = 'app/mcp'
  }
  return config
}