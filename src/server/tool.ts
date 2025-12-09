/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { InferJSONSchema, JSONSchema } from '../types/method.js'
import type { ToolContext } from '../types/context.js'
import type { Content } from './contracts/content.js'

export abstract class Tool<T extends JSONSchema = JSONSchema> {
  abstract name: string
  title?: string
  description?: string

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
    }
  }

  abstract handle(ctx?: ToolContext & { args: InferJSONSchema<T> }): Promise<Content | Content[]>
}

export type AnyTool = Tool<JSONSchema>