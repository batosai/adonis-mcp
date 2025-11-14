/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { InferJSONSchema, JSONSchema } from '../types/method.js'
import type { McpContext } from '../types/context.js'

export abstract class Tool<S extends JSONSchema> {
  abstract name: string
  abstract title?: string
  abstract description?: string

  abstract schema?(): S

  abstract handle(
    ctx?: McpContext & { args: InferJSONSchema<S> }
  ):
    | Record<string, unknown>
    | Record<string, unknown>[]
    | Promise<Record<string, unknown> | Record<string, unknown>[]>
}
