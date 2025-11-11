/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Method } from '../../types/method.js'
import type { McpContext } from '../../types/context.js'

import { createError } from '@adonisjs/core/exceptions'
import Response from '../../response.js'

export default class Initialize implements Method {  
  handle(ctx: McpContext) {
    if (ctx.request.method !== 'initialize') {
      throw createError('Invalid request method for initialize handler', 'E_INVALID_REQUEST_METHOD', -32000)
    }
    const requestedVersion = ctx.request.params.protocolVersion ?? null

    if (requestedVersion !== null && !ctx.supportedProtocolVersions.includes(requestedVersion)) {
      throw createError('Unsupported protocol version', 'E_JSON_RPC_ERROR', -32000)
    }

    const protocolVersion = requestedVersion ?? ctx.supportedProtocolVersions[0]


    const initResult = {
      protocolVersion,
      capabilities: ctx.serverCapabilities,
      serverInfo: {
        name: ctx.serverName,
        version: ctx.serverVersion,
      },
      instructions: ctx.instructions,
    }

    return Response.result(ctx.request.id, initResult)
  }
}