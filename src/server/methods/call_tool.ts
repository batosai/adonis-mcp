/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { ToolContext, ResourceContext } from '../../types/context.js'
import type { Content } from '../contracts/content.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import Response from '../../response.js'
import ErrorContent from '../contents/error.js'
import ResourceLink from '../contents/resource_link.js'
import EmbeddedResource from '../contents/embedded_resource.js'
import Structured from '../contents/structured.js'

export default class CallTool implements Method {
  async handle(ctx: ToolContext) {
    const params = ctx.request.params

    if (!params?.name) {
      throw new JsonRpcException(
        `The tool name is required.`,
        ErrorCode.InvalidParams,
        ctx.request.id
      )
    }

    const item = Object.keys(ctx.tools).find((key) => key === params.name)

    if (!item) {
      throw new JsonRpcException(
        `The tool ${params.name} was not found.`,
        ErrorCode.MethodNotFound,
        ctx.request.id
      )
    }

    let Tool
    try {
      const module = await import(ctx.tools[item])
      Tool = module.default
    } catch (error: any) {
      throw new JsonRpcException(
        `Failed to import tool ${params.name}: ${error.message}`,
        ErrorCode.InternalError,
        ctx.request.id
      )
    }

    ;(ctx as any).args = params.arguments ?? {}

    const tool = new Tool(ctx)
    const contents = await tool.handle(ctx)

    let data: Content[]
    if (!Array.isArray(contents)) {
      data = [contents]
    } else {
      data = contents
    }

    let isError = false
    const result: Record<string, any> = { content: [] }
    for await (const content of data) {
      if (content instanceof ResourceLink || content instanceof EmbeddedResource) {
        await content.preProcess(ctx.resources, ctx as unknown as ResourceContext)
      }

      if (content instanceof Structured) {
        result.structuredContent = content.structuredContent
      }

      result.content.push(await content.toTool(tool))

      if (content instanceof ErrorContent) {
        isError = true
      }
    }

    if (isError) {
      result.isError = true
    }

    return Response.toJsonRpc({ id: ctx.request.id, result })
  }
}
