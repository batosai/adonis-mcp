/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { DiscoverResult } from '../../types/jsonrpc.js'
import type { McpContext } from '../../types/context.js'
import type { Method } from '../../types/method.js'

import Response from '../../response.js'

export default class Discover implements Method {
  handle(ctx: McpContext) {
    const result: DiscoverResult = {
      resultType: 'complete',
      supportedVersions: ctx.supportedProtocolVersions,
      capabilities: ctx.serverCapabilities,
      instructions: ctx.instructions,
      ttlMs: 0,
      cacheScope: 'private',
      _meta: {
        'io.modelcontextprotocol/serverInfo': {
          name: ctx.serverName,
          version: ctx.serverVersion,
        },
      },
    }

    return Response.toJsonRpc({ id: ctx.request.id, result })
  }
}
