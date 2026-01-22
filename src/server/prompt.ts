/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JSONSchema } from '../types/method.js'
import type { Completion } from '../types/jsonrpc.js'
import type { PromptContext, CompleteContext } from '../types/context.js'
import type { InferJSONSchema } from '../types/method.js'
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

  abstract handle(ctx?: PromptContext<T>, ...args: unknown[]): Promise<Content | Content[]>

  async complete(
    ctx?: CompleteContext<InferJSONSchema<T>>,
    ..._args: unknown[]
  ): Promise<Completion> {
    return ctx!.response.complete({
      values: [],
    })
  }
}
