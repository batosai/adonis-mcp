/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import type { ImageContent } from '../../types/content.js'
import type { AnyTool as Tool } from '../tool.js'
import type { Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'
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

  toTool(_tool: Tool): ImageContent {
    return {
      type: 'image' as const,
      data: this.data,
      mimeType: this.mimeType,
      _meta: this._meta
    }
  }

  toPrompt(_prompt: Prompt): ImageContent {
    return {
      type: 'image' as const,
      data: this.data,
      mimeType: this.mimeType,
      _meta: this._meta
    }
  }

  toResource(_resource: Resource): never {
    throw createError(
      'Image content may not be used in resources.',
      'E_IMAGE_NOT_SUPPORTED'
    )
  }
}