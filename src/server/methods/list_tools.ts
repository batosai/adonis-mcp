/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ListToolsResult } from '../../types/jsonrpc.js'
import type { McpContext } from '../../types/context.js'
import type { Method } from '../../types/method.js'
import type { McpRegistryEntry } from '../../types/method.js'

import { CursorPaginator } from '../pagination/cursor_paginator.js'
import Response from '../../response.js'

export default class ListTools implements Method {
  async handle(ctx: McpContext) {
    let nextCursor

    const paginator = new CursorPaginator(
      Object.values(ctx.tools),
      ctx.getPerPage(),
      ctx.request.params?.cursor
    )
    const paginatedTools = paginator.paginate('tools')

    const tools = (paginatedTools['tools'] as McpRegistryEntry[]).map((entry) => entry.json)

    if (paginatedTools.nextCursor) {
      nextCursor = paginatedTools.nextCursor
    }

    return Response.toJsonRpc({
      id: ctx.request.id,
      result: { tools, nextCursor } as ListToolsResult,
    })
  }
}
