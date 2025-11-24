/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import { createError } from '@adonisjs/core/exceptions'

export default class Blob implements Content {
  text: string

  constructor(text: string | Buffer) {
    if (typeof text === 'string') {
      this.text = Buffer.from(text).toString('base64')
    } else {
      this.text = text.toString('base64')
    }
  }

  toTool() {
    throw createError(
      'Blob content may not be used in tools.',
      'E_BLOB_NOT_SUPPORTED'
    )
  }

  toPrompt() {
    throw createError(
      'Blob content may not be used in prompts.',
      'E_BLOB_NOT_SUPPORTED'
    )
  }

  toResource() {
    return { blob: this.text }
  }
}