/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { HttpContext } from '@adonisjs/core/http'

export default class McpController {
  async post(ctx: HttpContext) {
    const body = ctx.request.body()
    const method = body.method

    console.log('body', body)
    console.log('method:', method)

    const mcp = await ctx.containerResolver.make('jrmc.mcp')
    return await mcp.handle(body)
  }
}
