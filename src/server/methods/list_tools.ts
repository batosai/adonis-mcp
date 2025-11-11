/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { McpContext } from '../../types/context.js'

// import { createError } from '@adonisjs/core/exceptions'
import Response from '../../response.js'

export default class ListTools implements Method {
  async handle(ctx: McpContext) {
    const tools = await Promise.all(
      Object.values(ctx.tools).map(async (filepath: string) => {
        try {
          const { default: Tool } = await import(filepath)
          const tool = new Tool()

          const schema = tool.schema() ?? {
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
          console.error(error)
          // throw createError(
          //   `Error listing tool ${tool.name}`,
          //   'E_LIST_TOOLS_ERROR',
          //   -32601,
          // )
        }
      })
    )

    return Response.result(ctx.request.id, { tools })
  }
}