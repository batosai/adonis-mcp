/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ReadResourceResult } from '../../types/jsonrpc.js'
import type { Method } from '../../types/method.js'
import type { ResourceContext } from '../../types/context.js'
import type { Content } from '../contracts/content.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import Response from '../../response.js'
import { findResource } from '../../utils/find_resource_pattern.js'

import applicationService from '@adonisjs/core/services/app'

export default class ReadResource implements Method {
  async handle(ctx: ResourceContext, app = applicationService) {
    const params = ctx.request.params

    if (!params?.uri || typeof params.uri !== 'string') {
      throw new JsonRpcException(
        `The resource URI is required.`,
        ErrorCode.InvalidParams,
        ctx.request.id
      )
    }

    const resource = await findResource({
      app,
      uri: params.uri,
      resourceList: { ...ctx.resources, ...ctx.resourceTemplates },
      ctx,
    })

    const content = await app.container.call(resource, 'handle', [ctx])

    const data: Content[] = [content]

    const result: ReadResourceResult = { contents: [] }
    for (const content of data) {
      result.contents.push(await content.toResource(resource))
    }

    return Response.toJsonRpc({ id: ctx.request.id, result })
  }
}
