/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { McpContext } from '../../types/context.js'

import Response from '../../response.js'

export default class ListPrompts implements Method {
  handle(ctx: McpContext) {
    const promptsArray = Object.values(ctx.prompts)
    return Response.toJsonRpc({ id: ctx.request.id, result: { prompts: promptsArray } })
  }
}
