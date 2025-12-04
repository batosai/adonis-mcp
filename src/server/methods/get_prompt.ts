/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { McpContext, PromptContext } from '../../types/context.js'
import type Role from '../../enums/role.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import Response from '../../response.js'

export default class GetPrompt implements Method {
  async handle(ctx: McpContext) {
    const promptContext = ctx as unknown as PromptContext
    const params = promptContext.request.params

    if (!params?.name) {
      throw new JsonRpcException(`The prompt name is required.`, ErrorCode.InvalidParams, promptContext.request.id)
    }

    const item = Object.keys(promptContext.prompts).find((key) => key === params.name)

    if (!item) {
      throw new JsonRpcException(`The prompt ${params.name} was not found.`, ErrorCode.MethodNotFound, promptContext.request.id)
    }

    const { default: Prompt } = await import(promptContext.prompts[item])

    ;(promptContext as any).args = params.arguments ?? {}

    const prompt = new Prompt(promptContext)
    const contents = await prompt.handle(promptContext)

    let data: any[]
    if (!Array.isArray(contents)) {
      data = [contents]
    } else {
      data = contents
    }

    if (!data || data.length === 0) {
      throw new JsonRpcException(`The prompt ${params.name} returned no content.`, ErrorCode.InternalError, promptContext.request.id)
    }

    let messages: { role: Role; content: Record<string, any> }[] = []
    data.forEach((content) => {
      if (!content || !content.role) {
        throw new JsonRpcException(`Invalid content returned from prompt ${params.name}.`, ErrorCode.InternalError, promptContext.request.id)
      }
      messages.push({
        role: content.role as Role,
        content: content.toPrompt(prompt),
      })
    })

    if (messages.length === 0) {
      throw new JsonRpcException(`The prompt ${params.name} returned no valid messages.`, ErrorCode.InternalError, promptContext.request.id)
    }

    const result = {
      description: prompt.description,
      messages,
    }
  
    return Response.toJsonRpc({ id: ctx.request.id, result})
  }
}
