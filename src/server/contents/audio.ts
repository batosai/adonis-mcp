/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import type { AudioContent } from '../../types/content.js'
import type { AnyTool as Tool } from '../tool.js'
import type { Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'
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

  toTool(_tool: Tool): AudioContent {
    return {
      type: 'audio' as const,
      data: this.data,
      mimeType: this.mimeType,
      _meta: this._meta
    }
  }

  toPrompt(_prompt: Prompt): AudioContent {
    return {
      type: 'audio' as const,
      data: this.data,
      mimeType: this.mimeType,
      _meta: this._meta
    }
  }

  toResource(_resource: Resource): never {
    throw createError(
      'Audio content may not be used in resources.',
      'E_AUDIO_NOT_SUPPORTED'
    )
  }
}