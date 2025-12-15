/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ListResourcesResult } from '../../types/jsonrpc.js'
import type { McpContext } from '../../types/context.js'
import type { Method } from '../../types/method.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import { CursorPaginator } from '../pagination/cursor_paginator.js'
import Response from '../../response.js'

export default class ListResources implements Method {
  async handle(ctx: McpContext) {
    let nextCursor

    const paginator = new CursorPaginator(
      Object.values(await ctx.getResources()),
      ctx.getPerPage(),
      ctx.request.params?.cursor
    )
    const paginatedResources = paginator.paginate('resources')

    const resources = await Promise.all(
      (paginatedResources['resources'] as string[]).map(async (filepath: string) => {
        try {
          const { default: Resource } = await import(filepath)
          const resource = new Resource()
          return resource.toJson()
        } catch (error) {
          throw new JsonRpcException(
            `Error listing resource`,
            ErrorCode.InternalError,
            ctx.request.id,
            { error }
          )
        }
      })
    )

    if (paginatedResources.nextCursor) {
      nextCursor = paginatedResources.nextCursor
    }

    return Response.toJsonRpc({
      id: ctx.request.id,
      result: { resources, nextCursor } as ListResourcesResult,
    })
  }
}
