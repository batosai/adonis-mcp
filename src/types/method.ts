/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ApplicationService } from '@adonisjs/core/types'
import type { McpContext } from './context.js'
import type { JsonRpcResponse } from './jsonrpc.js'

export interface Method {
  handle(ctx: McpContext, app?: ApplicationService): JsonRpcResponse | Promise<JsonRpcResponse>
}

export type McpRegistryEntry = { path: string; json: Record<string, unknown> }
export type ToolList = Record<string, McpRegistryEntry>
export type ResourceList = Record<string, McpRegistryEntry>
export type PromptList = Record<string, McpRegistryEntry>

export type JSONSchema =
  | { type: 'string' }
  | { type: 'number' }
  | { type: 'boolean' }
  | { type: 'object'; properties: Record<string, JSONSchema>; required?: readonly string[] }

export type InferJSONSchema<S extends JSONSchema> = S['type'] extends 'string'
  ? string
  : S['type'] extends 'number'
    ? number
    : S['type'] extends 'boolean'
      ? boolean
      : S extends {
            type: 'object'
            properties: infer P extends Record<string, JSONSchema>
            required?: infer R
          }
        ? R extends readonly string[]
          ? { [K in keyof P as K extends R[number] ? K : never]: InferJSONSchema<P[K]> } & {
              [K in keyof P as K extends R[number] ? never : K]?: InferJSONSchema<P[K]>
            }
          : { [K in keyof P]?: InferJSONSchema<P[K]> }
        : never

export type BaseSchema<
  P extends Record<string, any> = {},
  R extends readonly (keyof P & string)[] = readonly (keyof P & string)[],
> = {
  type: 'object'
  properties: P
  required?: R
}
