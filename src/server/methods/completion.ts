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

import applicationService from '@adonisjs/core/services/app'

export default class Completion implements Method {
  async handle(ctx: CompleteContext, app = applicationService) {
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

    let entry = null
    let key = null
    if (ref && ref.type === 'ref/prompt') {
      key = ref.name
      entry = ctx.prompts[key]
    } else if (ref && ref.type === 'ref/resource') {
      key = ref.uri
      entry = ctx.resources[key] ?? ctx.resourceTemplates[key]
    }

    if (!entry) {
      throw new JsonRpcException(`${key} was not found.`, ErrorCode.InvalidParams, ctx.request.id)
    }

    const { default: Model } = await import(entry.path)
    const entity = await app.container.make(Model)

    let args = {}
    if (context?.arguments) {
      args = { ...args, ...context.arguments }
    }

    ;(ctx as any).args = { ...args, [argument.name]: argument.value }

    const result = {
      completion: await app.container.call(entity, 'complete', [ctx]),
    } as CompleteResult

    return Response.toJsonRpc({ id: ctx.request.id, result })
  }
}
