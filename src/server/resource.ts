/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ResourceContext } from '../types/context.js'
import type { Content } from './contracts/content.js'

import string from '@adonisjs/core/helpers/string'

export abstract class Resource {

  abstract name: string
  title?: string
  description?: string
  mimeType?: string
  size?: number

  get uri(): string {
    return `file://resources/${string.dashCase(this.constructor.name)}`
  }

  toJson() {
    const data: Record<string, unknown> = {
      name: this.name,
      title: this.title,
      description: this.description,
      size: this.size,
      mimeType: this.mimeType,
    }

    if ((this as any).getUriTemplate !== undefined) {
      data.uriTemplate = (this as any).getUriTemplate()
    } else {
      data.uri = this.uri
    }

    return data
  }


  abstract handle(ctx?: ResourceContext): Promise<Content>
}