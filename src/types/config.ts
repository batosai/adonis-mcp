/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { CacheScope } from './jsonrpc.js'

export type CacheHintConfig = {
  ttlMs?: number
  scope?: CacheScope
}

export type McpCacheConfig = {
  discover?: CacheHintConfig
  tools?: CacheHintConfig
  resources?: CacheHintConfig
  resourceTemplates?: CacheHintConfig
  prompts?: CacheHintConfig
}

export type McpConfig = {
  name?: string
  version?: string
  instructions?: string
  path?: string
  maxPaginationLength?: number
  defaultPaginationLength?: number
  completions?: boolean
  cache?: McpCacheConfig
}
