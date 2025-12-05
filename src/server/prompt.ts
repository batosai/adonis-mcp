/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { InferJSONSchema, JSONSchema } from '../types/method.js'
import type { PromptContext } from '../types/context.js'
import type { Content } from '../server/content.js'
import type Role from '../enums/role.js'

export abstract class Prompt<T extends JSONSchema> {
  abstract name: string
  abstract title?: string
  abstract description?: string
  abstract role?: Role

  abstract schema?(): T

  abstract handle(ctx?: PromptContext & { args: InferJSONSchema<T> }): Promise<Content | Content[]>
}

export type AnyPrompt = Prompt<JSONSchema>
