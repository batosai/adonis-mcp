/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { McpContext } from '../../types/context.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import Response from '../../response.js'

export default class Initialize implements Method {
  handle(ctx: McpContext) {
    if (ctx.request.method !== 'initialize') {
      throw new JsonRpcException(
        'Invalid request method for initialize handler',
        ErrorCode.InvalidRequest,
        ctx.request.id
      )
    }
    const requestedVersion = ctx.request.params.protocolVersion ?? null

    if (requestedVersion !== null && !ctx.supportedProtocolVersions.includes(requestedVersion)) {
      throw new JsonRpcException('Unsupported protocol version', ErrorCode.InvalidRequest, ctx.request.id)
    }

    const protocolVersion = requestedVersion ?? ctx.supportedProtocolVersions[0]

    const result = {
      protocolVersion,
      capabilities: ctx.serverCapabilities,
      serverInfo: {
        name: ctx.serverName,
        version: ctx.serverVersion,
      },
      instructions: ctx.instructions,
    }

    return Response.toJsonRpc({ id: ctx.request.id, result })
  }
}
