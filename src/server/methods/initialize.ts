/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { InitializeResult } from '../../types/jsonrpc.js'
import type { McpContext } from '../../types/context.js'
import type { Method } from '../../types/method.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import Response from '../../response.js'
import { MODERN_PROTOCOL_VERSION } from '../protocols/version.js'

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
    const supportedLegacyVersions = ctx.supportedProtocolVersions.filter(
      (version) => version !== MODERN_PROTOCOL_VERSION
    )

    if (requestedVersion !== null && !supportedLegacyVersions.includes(requestedVersion)) {
      throw new JsonRpcException(
        'Unsupported protocol version',
        ErrorCode.InvalidParams,
        ctx.request.id,
        {
          supported: supportedLegacyVersions,
          requested: requestedVersion,
        }
      )
    }

    const protocolVersion = requestedVersion ?? supportedLegacyVersions[0]

    const result: InitializeResult = {
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
