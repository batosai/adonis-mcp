/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ResourceContext } from '../types/context.js'
import type { Content } from '../server/content.js'

export abstract class Resource {
  abstract uri: string
  abstract title?: string
  abstract description?: string
  abstract name?: string
  abstract size?: number
  abstract mimeType?: string
  

  abstract handle(
    ctx?: ResourceContext
  ): Promise<Content | Content[]>
}
