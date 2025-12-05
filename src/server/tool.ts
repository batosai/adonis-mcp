/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { InferJSONSchema, JSONSchema } from '../types/method.js'
import type { ToolContext } from '../types/context.js'
import type { Content } from '../server/content.js'

export abstract class Tool<T extends JSONSchema> {
  abstract name: string
  abstract title?: string
  abstract description?: string

  abstract schema?(): T

  abstract handle(ctx?: ToolContext & { args: InferJSONSchema<T> }): Promise<Content | Content[]>
}

export type AnyTool = Tool<JSONSchema>
