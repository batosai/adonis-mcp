/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import { createError } from '@adonisjs/core/exceptions'

export default class Image implements Content {
  data: string
  mimeType: string
  _meta?: Record<string, unknown>

  constructor(data: string, mimeType: string, _meta?: Record<string, unknown>) {
    this.data = data
    this.mimeType = mimeType
    this._meta = _meta
  }

  toTool() {
    return {
      type: 'image' as const,
      data: this.data,
      mimeType: this.mimeType,
      _meta: this._meta
    }
  }

  toPrompt() {
    return {
      type: 'image' as const,
      data: this.data,
      mimeType: this.mimeType,
      _meta: this._meta
    }
  }

  toResource() {
    throw createError(
      'Image content may not be used in resources.',
      'E_IMAGE_NOT_SUPPORTED'
    )
  }
}