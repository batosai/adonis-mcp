/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { McpContext } from '../../types/context.js'

import { createError } from '@adonisjs/core/exceptions'
import Response from '../../response.js'

export default class CallTool implements Method {  
  async handle(ctx: McpContext) {
    if (ctx.request.method !== 'tools/call') {
      throw createError(
        `The request method ${ctx.request.method} is not valid for tools/call handler.`,
        'E_INVALID_REQUEST_METHOD',
        -32601,
      )
    }

    const params = ctx.request.params

    if (!params?.name) {
      throw createError(
        `The tool name is required.`,
        'E_INVALID_REQUEST_PARAMS',
        -32602,
      )
    }

    const item = Object.keys(ctx.tools).find((key) => key === params.name)

    if (!item) {
      throw createError(
        `The tool ${params.name} was not found.`,
        'E_TOOL_NOT_FOUND',
        -32601,
      )
    }

    const { default: Tool } = await import(ctx.tools[item])
    const tool = new Tool(ctx)

    const content = await tool.handle(params.arguments ?? {}, ctx)

    return Response.result(ctx.request.id, content)
  }
}