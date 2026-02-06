/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { CallToolResult, ContentBlock } from '../../types/jsonrpc.js'
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

import applicationService from '@adonisjs/core/services/app'

export default class CallTool implements Method {
  async handle(ctx: ToolContext, app = applicationService) {
    const params = ctx.request.params

    if (!params?.name) {
      throw new JsonRpcException(
        `The tool name is required.`,
        ErrorCode.InvalidParams,
        ctx.request.id
      )
    }

    const entry = ctx.tools[params.name]

    if (!entry) {
      throw new JsonRpcException(
        `The tool ${params.name} was not found.`,
        ErrorCode.InvalidParams,
        ctx.request.id
      )
    }

    let Tool
    try {
      const module = await import(entry.path)
      Tool = module.default
    } catch (error: any) {
      throw new JsonRpcException(
        `Failed to import tool ${params.name}: ${error.message}`,
        ErrorCode.InternalError,
        ctx.request.id
      )
    }

    ;(ctx as any).args = params.arguments ?? {}

    const tool = await app.container.make(Tool)

    let contents: Content[] | Content
    try {
      contents = await app.container.call(tool, 'handle', [ctx])
    } catch (error) {
      if (error instanceof JsonRpcException) {
        throw error
      }
      contents = error
    }

    let data: Content[]
    if (!Array.isArray(contents)) {
      data = [contents]
    } else {
      data = contents
    }

    let isError = false
    const result: CallToolResult = { content: [] }
    for await (const obj of data) {
      if (obj instanceof ResourceLink || obj instanceof EmbeddedResource) {
        await obj.preProcess(ctx as unknown as ResourceContext)
      }

      if (obj instanceof Structured) {
        result.structuredContent = obj.structuredContent
      } else if (obj instanceof ErrorContent) {
        isError = true
        result.content.push(await obj.toTool(tool))
      } else {
        result.content.push((await obj.toTool(tool)) as ContentBlock)
      }
    }

    if (isError) {
      result.isError = true
    }

    return Response.toJsonRpc({ id: ctx.request.id, result })
  }
}
