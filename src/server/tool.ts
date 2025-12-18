/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JSONSchema } from '../types/method.js'
import type { ToolContext } from '../types/context.js'
import type { Content } from './contracts/content.js'
import type { ToolAnnotations } from '../types/jsonrpc.js'

export abstract class Tool<T extends JSONSchema = JSONSchema> {
  abstract name: string
  title?: string
  description?: string
  annotations?: ToolAnnotations
  meta?: Record<string, unknown>

  schema(): T {
    return {
      type: 'object',
      properties: {},
    } as T
  }

  toJson() {
    const schema = this.schema()

    return {
      name: this.name,
      title: this.title,
      description: this.description,
      inputSchema: schema,
      annotations: this.annotations,
      _meta: this.meta,
    }
  }

  abstract handle(ctx?: ToolContext<T>): Promise<Content | Content[]>
}
