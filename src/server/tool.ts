/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { InferJSONSchema, JSONSchema } from '../types/method.js'
import type { McpContext } from '../types/context.js'
import type { TextResponse, ImageResponse, AudioResponse } from '../types/response.js'

export abstract class Tool<S extends JSONSchema> {
  abstract name: string
  abstract title?: string
  abstract description?: string

  abstract schema?(): S

  abstract handle(
    ctx?: McpContext & { args: InferJSONSchema<S> }
  ):
    | TextResponse | ImageResponse | AudioResponse
    | Array<TextResponse | ImageResponse | AudioResponse>
    | Promise<
        TextResponse | ImageResponse | AudioResponse | 
        Array<TextResponse | ImageResponse | AudioResponse>
      >
}
