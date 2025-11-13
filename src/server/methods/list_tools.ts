/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { McpContext } from '../../types/context.js'

import { CursorPaginator } from '../pagination/cursor_paginator.js'
import Response from '../../response.js'

export default class ListTools implements Method {
  async handle(ctx: McpContext) {
    let error = false
    let nextCursor

    const paginator = new CursorPaginator(
      Object.values(ctx.tools), 
      ctx.getPerPage(), 
      ctx.request.params?.cursor
    )
    const paginatedTools = paginator.paginate('tools')

    const tools = await Promise.all(
      (paginatedTools['tools'] as string[]).map(async (filepath: string) => {
        try {
          const { default: Tool } = await import(filepath)
          const tool = new Tool()

          const schema = tool.schema ? tool.schema() : {
            type: 'object',
            properties: {},
          }

          return {
            name: tool.name,
            title: tool.title,
            description: tool.description,
            inputSchema: {
              type: schema.type,
              properties: schema.properties,
              required: schema.required ?? [],
            }
          }
        } catch (error) {
          error = true
        }
      })
    )

    if (error) {
      return Response.toJsonRpc({ id: ctx.request.id, error: { 
        code: -32601,
        message: `Error listing tool`,
      }})
    }

    if (paginatedTools.nextCursor) {
      nextCursor = paginatedTools.nextCursor
    }

    return Response.toJsonRpc({ id: ctx.request.id, result: { tools, nextCursor } })
  }
}