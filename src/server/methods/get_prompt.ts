/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { GetPromptResult, PromptMessage } from '../../types/jsonrpc.js'
import type { Method } from '../../types/method.js'
import type { PromptContext, ResourceContext } from '../../types/context.js'
import type { Content } from '../contracts/content.js'
import type Role from '../../enums/role.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import EmbeddedResource from '../contents/embedded_resource.js'
import Text from '../contents/text.js'
import Image from '../contents/image.js'
import Audio from '../contents/audio.js'
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

    const pathToPrompt = ctx.prompts[params.name]

    if (!pathToPrompt) {
      throw new JsonRpcException(
        `The prompt ${params.name} was not found.`,
        ErrorCode.InvalidParams,
        ctx.request.id
      )
    }

    const { default: Prompt } = await import(pathToPrompt)

    ;(ctx as any).args = params.arguments ?? {}

    const prompt = new Prompt(ctx)
    const contents = await prompt.handle(ctx)

    let data: Content[]
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

    let messages: PromptMessage[] = []
    for await (const content of data) {
      if (content instanceof EmbeddedResource) {
        await content.preProcess(ctx as unknown as ResourceContext)
      }

      if (
        content instanceof Text ||
        content instanceof Image ||
        content instanceof Audio ||
        content instanceof EmbeddedResource
      ) {
        if (!content || !content.role) {
          throw new JsonRpcException(
            `Invalid content returned from prompt ${params.name}.`,
            ErrorCode.InternalError,
            ctx.request.id
          )
        }
        messages.push({
          role: content.role as Role,
          content: await content.toPrompt(prompt),
        })
      }
    }

    if (messages.length === 0) {
      throw new JsonRpcException(
        `The prompt ${params.name} returned no valid messages.`,
        ErrorCode.InternalError,
        ctx.request.id
      )
    }

    const result: GetPromptResult = {
      description: prompt.description,
      messages,
    }

    return Response.toJsonRpc({ id: ctx.request.id, result })
  }
}
