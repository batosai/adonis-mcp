/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpContext } from './context.js'

export interface Method {
  handle(ctx: McpContext): Record<string, any>
}

export type ToolList = Record<string, string>
export type ResourceList = Record<string, string>
export type PromptList = Record<string, string>

export type JSONSchema =
  | { type: 'string' }
  | { type: 'number' }
  | { type: 'boolean' }
  | { type: 'object'; properties: Record<string, JSONSchema>; required?: string[] }

type ObjectSchema = Extract<JSONSchema, { type: 'object' }>

export type InferJSONSchema<S extends JSONSchema> = S['type'] extends 'string'
  ? string
  : S['type'] extends 'number'
    ? number
    : S['type'] extends 'boolean'
      ? boolean
      : S extends ObjectSchema
        ? {
            [K in keyof S['properties'] as K extends string ? K : never]: K extends (
              S['required'] extends readonly string[] ? S['required'][number] : never
            )
              ? InferJSONSchema<S['properties'][K]>
              : InferJSONSchema<S['properties'][K]> | undefined
          }
        : never

export type BaseSchema<P extends Record<string, any> = {}> = {
  type: 'object'
  properties: P
  required?: (keyof P)[]
}
