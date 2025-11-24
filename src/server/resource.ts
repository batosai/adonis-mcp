/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpContext } from '../types/context.js'

export abstract class Resource {
  abstract name: string
  abstract uri: string
  abstract title?: string
  abstract description?: string
  abstract size?: number
  abstract mimeType?: string
  

  abstract handle(
    ctx?: McpContext
  ):
    | Record<string, unknown>
    | Promise<Record<string, unknown>>
}
