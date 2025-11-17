/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { McpContext } from '../../types/context.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import Response from '../../response.js'

export default class CallTool implements Method {
  async handle(ctx: McpContext) {
    if (ctx.request.method !== 'tools/call') {
      throw new JsonRpcException(
        `The request method ${ctx.request.method} is not valid for tools/call handler.`,
        ErrorCode.MethodNotFound,
        ctx.request.id
      )
    }

    const params = ctx.request.params

    if (!params?.name) {
      throw new JsonRpcException(`The tool name is required.`, ErrorCode.InvalidParams, ctx.request.id)
    }

    const item = Object.keys(ctx.tools).find((key) => key === params.name)

    if (!item) {
      throw new JsonRpcException(`The tool ${params.name} was not found.`, ErrorCode.MethodNotFound, ctx.request.id)
    }

    const { default: Tool } = await import(ctx.tools[item])

    ;(ctx as any).args = params.arguments ?? {}

    const tool = new Tool(ctx)

    const data = await tool.handle(ctx)
    let result
    let error

    if (Array.isArray(data)) {
      result = { content: data }
    } else if (data.code) {
      error = data
    } else {
      result = { content: [data] }
    }

    return Response.toJsonRpc({ id: ctx.request.id, result, error })
  }
}
