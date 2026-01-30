/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ListPromptsResult } from '../../types/jsonrpc.js'
import type { McpContext } from '../../types/context.js'
import type { Method, McpRegistryEntry } from '../../types/method.js'

import { CursorPaginator } from '../pagination/cursor_paginator.js'
import Response from '../../response.js'

export default class ListPrompts implements Method {
  async handle(ctx: McpContext) {
    let nextCursor

    const paginator = new CursorPaginator(
      Object.values(ctx.prompts),
      ctx.getPerPage(),
      ctx.request.params?.cursor
    )
    const paginatedPrompts = paginator.paginate('prompts')

    const prompts = (paginatedPrompts['prompts'] as McpRegistryEntry[]).map((entry) => entry.json)

    if (paginatedPrompts.nextCursor) {
      nextCursor = paginatedPrompts.nextCursor
    }

    return Response.toJsonRpc({
      id: ctx.request.id,
      result: { prompts, nextCursor } as ListPromptsResult,
    })
  }
}
