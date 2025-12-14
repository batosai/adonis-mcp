/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { PromptContext, ResourceContext } from '../../types/context.js'
import type Role from '../../enums/role.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import EmbeddedResource from '../contents/embedded_resource.js'
import Response from '../../response.js'

export default class GetPrompt implements Method {
  async handle(ctx: PromptContext) {
    const params = ctx.request.params

    if (!params?.name) {
      throw new JsonRpcException(
        `The prompt name is required.`,
        ErrorCode.InvalidParams,
        ctx.request.id
      )
    }

    const item = Object.keys(ctx.prompts).find((key) => key === params.name)

    if (!item) {
      throw new JsonRpcException(
        `The prompt ${params.name} was not found.`,
        ErrorCode.MethodNotFound,
        ctx.request.id
      )
    }

    const { default: Prompt } = await import(ctx.prompts[item])

    ;(ctx as any).args = params.arguments ?? {}

    const prompt = new Prompt(ctx)
    const contents = await prompt.handle(ctx)

    let data: any[]
    if (!Array.isArray(contents)) {
      data = [contents]
    } else {
      data = contents
    }

    if (!data || data.length === 0) {
      throw new JsonRpcException(
        `The prompt ${params.name} returned no content.`,
        ErrorCode.InternalError,
        ctx.request.id
      )
    }

    let messages: { role: Role; content: Record<string, any> }[] = []
    for await (const content of data) {
      if (!content || !content.role) {
        throw new JsonRpcException(
          `Invalid content returned from prompt ${params.name}.`,
          ErrorCode.InternalError,
          ctx.request.id
        )
      }

      if (content instanceof EmbeddedResource) {
        await content.preProcess(ctx.resources, ctx as unknown as ResourceContext)
      }

      messages.push({
        role: content.role as Role,
        content: await content.toPrompt(prompt),
      })
    }

    if (messages.length === 0) {
      throw new JsonRpcException(
        `The prompt ${params.name} returned no valid messages.`,
        ErrorCode.InternalError,
        ctx.request.id
      )
    }

    const result = {
      description: prompt.description,
      messages,
    }

    return Response.toJsonRpc({ id: ctx.request.id, result })
  }
}
