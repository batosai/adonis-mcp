/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import type { AudioResponse } from '../../types/response.js'
import { createError } from '@adonisjs/core/exceptions'

export default class Audio implements Content {
  data: string
  mimeType: string
  _meta?: Record<string, unknown>

  constructor(data: string, mimeType: string, _meta?: Record<string, unknown>) {
    this.data = data
    this.mimeType = mimeType
    this._meta = _meta
  }

  toTool(): AudioResponse {
    return {
      type: 'audio' as const,
      data: this.data,
      mimeType: this.mimeType,
      _meta: this._meta
    }
  }

  toPrompt(): AudioResponse {
    return {
      type: 'audio' as const,
      data: this.data,
      mimeType: this.mimeType,
      _meta: this._meta
    }
  }

  toResource(): never {
    throw createError(
      'Audio content may not be used in resources.',
      'E_AUDIO_NOT_SUPPORTED'
    )
  }
}