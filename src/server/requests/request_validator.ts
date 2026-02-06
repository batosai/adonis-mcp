import type { VineValidator } from '@vinejs/vine'
import type { Infer, SchemaTypes } from '@vinejs/vine/types'
import type {
  ToolContext,
  ResourceContext,
  PromptContext,
  CompleteContext,
} from '../../types/context.js'

import type { ValidationOptions } from '@vinejs/vine/types'

import JsonRpcError from '../exceptions/jsonrpc_error.js'

type Context = ToolContext | ResourceContext | PromptContext | CompleteContext

type RequestValidationOptions<MetaData extends undefined | Record<string, any>> =
  ValidationOptions<MetaData> & { data?: any }

import { ErrorCode } from '../../enums/error.js'
import JsonRpcException from '../exceptions/jsonrpc_exception.js'

export class RequestValidator {
  #ctx: Context

  constructor(ctx: Context) {
    this.#ctx = ctx
  }

  async validateUsing<Schema extends SchemaTypes, MetaData extends undefined | Record<string, any>>(
    validator: VineValidator<Schema, MetaData>,
    ...[options]: [undefined] extends MetaData
      ? [options?: RequestValidationOptions<MetaData> | undefined]
      : [options: RequestValidationOptions<MetaData>]
  ): Promise<Infer<Schema>> {
    const validatorOptions: RequestValidationOptions<any> = options || {}

    const data = validatorOptions.data || this.#ctx.args
    try {
      return await validator.validate(data, validatorOptions as any)
    } catch (error) {
      if (this.#ctx.request.method === 'tools/call') {
        throw new JsonRpcError(error.messages).toJsonRpcResponse()
      } else {
        const messages = error.messages.map((m: { message: string }) => m.message)
        throw new JsonRpcException(
          messages.join(', '),
          ErrorCode.InvalidParams,
          this.#ctx.request.id
        )
      }
    }
  }
}
