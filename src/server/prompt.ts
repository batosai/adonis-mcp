/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JSONSchema } from '../types/method.js'
import type { PromptContext } from '../types/context.js'
import type { Content } from './contracts/content.js'

export abstract class Prompt<T extends JSONSchema = JSONSchema> {
  abstract name: string
  title?: string
  description?: string
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
      _meta: this.meta,
    }
  }

  abstract handle(ctx?: PromptContext<T>): Promise<Content | Content[]>
}

export type AnyPrompt = Prompt<JSONSchema>
