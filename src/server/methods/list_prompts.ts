/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpContext } from '../../types/context.js'
import type { Method } from '../../types/method.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
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

    const prompts = await Promise.all(
      (paginatedPrompts['prompts'] as string[]).map(async (filepath: string) => {
        try {
          const { default: Prompt } = await import(filepath)
          const prompt = new Prompt()
          return prompt.toJson()
        } catch (error) {
          throw new JsonRpcException(
            `Error listing prompt`,
            ErrorCode.InternalError,
            ctx.request.id,
            { error }
          )
        }
      })
    )

    if (paginatedPrompts.nextCursor) {
      nextCursor = paginatedPrompts.nextCursor
    }

    return Response.toJsonRpc({ id: ctx.request.id, result: { prompts, nextCursor } })
  }
}
