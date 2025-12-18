/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { CompleteContext } from '../../types/context.js'
import type { Method } from '../../types/method.js'
import type { CompleteResult } from '../../types/jsonrpc.js'

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'
import Response from '../../response.js'

export default class Completion implements Method {
  async handle(ctx: CompleteContext) {
    const params = ctx.request.params

    if (!params?.argument?.name || !params?.argument?.value) {
      throw new JsonRpcException(
        'The argument name and value are required.',
        ErrorCode.InvalidParams,
        ctx.request.id
      )
    }

    const argument = params.argument
    const context = params.context
    const ref = params.ref

    let path = null
    let key = null
    if (ref && ref.type === 'ref/prompt') {
      key = ref.name
      path = ctx.prompts[key]
    } else if (ref && ref.type === 'ref/resource') {
      key = ref.uri
      path = ctx.resources[key]
    }

    if (!path) {
      throw new JsonRpcException(`${key} was not found.`, ErrorCode.InvalidParams, ctx.request.id)
    }

    const { default: Model } = await import(path)
    const entity = new Model(ctx)

    let args = {}
    if (context?.arguments) {
      args = { ...args, ...context.arguments }
    }

    ;(ctx as any).args = { ...args, [argument.name]: argument.value }

    const result = {
      completion: await entity.complete(ctx),
    } as CompleteResult

    return Response.toJsonRpc({ id: ctx.request.id, result })
  }
}
