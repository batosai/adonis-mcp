/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { McpContext, ResourceContext } from '../../types/context.js'
import type { Content } from '../content.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import Response from '../../response.js'

export default class ReadResource implements Method {
  async handle(ctx: McpContext) {
    const resourceContext = ctx as unknown as ResourceContext
    const params = ctx.request.params

    if (!params?.uri) {
      throw new JsonRpcException(
        `The resource URI is required.`,
        ErrorCode.InvalidParams,
        resourceContext.request.id
      )
    }

    const item = Object.keys(resourceContext.resources).find((key) => key === params.uri)

    if (!item) {
      throw new JsonRpcException(
        `The resource ${params.uri} was not found.`,
        ErrorCode.MethodNotFound,
        resourceContext.request.id
      )
    }

    const { default: Resource } = await import(resourceContext.resources[item])

    const resource = new Resource(resourceContext)
    const contents = await resource.handle(resourceContext)

    let data: Content[]
    if (!Array.isArray(contents)) {
      data = [contents]
    } else {
      data = contents
    }

    const result: Record<string, any> = { contents: [] }
    data.forEach((content) => {
      result.contents.push(content.toResource(resource))
    })

    return Response.toJsonRpc({ id: ctx.request.id, result })
  }
}
