/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ListResourcesResult } from '../../types/jsonrpc.js'
import type { McpContext } from '../../types/context.js'
import type { Method, McpRegistryEntry } from '../../types/method.js'

import { CursorPaginator } from '../pagination/cursor_paginator.js'
import Response from '../../response.js'

export default class ListResources implements Method {
  async handle(ctx: McpContext) {
    let nextCursor

    const paginator = new CursorPaginator(
      Object.values(ctx.resources),
      ctx.getPerPage(),
      ctx.request.params?.cursor
    )
    const paginatedResources = paginator.paginate('resources')

    const resources = (paginatedResources['resources'] as McpRegistryEntry[]).map(
      (entry) => entry.json
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
