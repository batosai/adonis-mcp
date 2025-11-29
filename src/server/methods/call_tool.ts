/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { McpContext, ToolContext } from '../../types/context.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'

export default class CallTool implements Method {
  async handle(ctx: McpContext) {
    const toolContext = ctx as unknown as ToolContext
    const params = toolContext.request.params

    if (!params?.name) {
      throw new JsonRpcException(`The tool name is required.`, ErrorCode.InvalidParams, toolContext.request.id)
    }

    const item = Object.keys(toolContext.tools).find((key) => key === params.name)

    if (!item) {
      throw new JsonRpcException(`The tool ${params.name} was not found.`, ErrorCode.MethodNotFound, toolContext.request.id)
    }

    const { default: Tool } = await import(toolContext.tools[item])

    ;(toolContext as any).args = params.arguments ?? {}

    const tool = new Tool(toolContext)
    const response = await tool.handle(toolContext)
    return response.render(tool)
  }
}
