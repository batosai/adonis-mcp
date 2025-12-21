/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ResourceContext, CompleteContext } from '../types/context.js'
import type { Content } from './contracts/content.js'
import type { Annotations, Completion } from '../types/jsonrpc.js'

import string from '@adonisjs/core/helpers/string'
import { UriTemplate } from '../utils/uri_template.js'

export abstract class Resource<T = {}> {
  uri: string = `file:///resources/${string.dashCase(this.constructor.name)}`
  abstract name: string
  title?: string
  description?: string
  mimeType?: string
  size?: number
  annotations?: Annotations
  meta?: Record<string, unknown>

  toJson() {
    const data: Record<string, unknown> = {
      name: this.name,
      title: this.title,
      description: this.description,
      size: this.size,
      mimeType: this.mimeType,
      annotations: this.annotations,
      _meta: this.meta,
    }

    if (UriTemplate.isTemplate(this.uri)) {
      data.uriTemplate = this.uri
    } else {
      data.uri = this.uri
    }

    return data
  }

  abstract handle(ctx?: ResourceContext<T>): Promise<Content>

  async complete(ctx?: CompleteContext<T>): Promise<Completion> {
    return await ctx!.response.complete({
      values: [],
    })
  }
}
