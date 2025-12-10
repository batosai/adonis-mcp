/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpContext } from '../contracts/context.js'
import type { Method } from '../../types/method.js'
import type { ResourceContext } from '../../types/context.js'
import type { Content } from '../contracts/content.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import Response from '../../response.js'
import { UriTemplate } from '../../utils/uri_template.js'

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

    const item = Object.keys(resourceContext.resources).find((key) => {
      if (key === params.uri) {
        return true
      }

      const uriTemplate = new UriTemplate(key)
      const variables = uriTemplate.match(params.uri as string)
      if (variables) {
        ;(resourceContext as any).args = variables ?? {}
        return true
      }
    })

    if (!item) {
      throw new JsonRpcException(
        `The resource ${params.uri} was not found.`,
        ErrorCode.MethodNotFound,
        resourceContext.request.id
      )
    }

    const { default: Resource } = await import(resourceContext.resources[item])

    const resource = new Resource(resourceContext)
    const content = await resource.handle(resourceContext)

    const data: Content[] = [content]

    const result: Record<string, any> = { contents: [] }
    data.forEach(async (content) => {
      result.contents.push(await content.toResource(resource))
    })

    return Response.toJsonRpc({ id: ctx.request.id, result })
  }
}
