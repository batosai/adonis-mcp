/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import type { TextResponse } from '../../types/response.js'

export default class Text implements Content {
  text: string

  constructor(text: string | unknown) {
    if (typeof text === 'string') {
      this.text = text
    } else {
      this.text = JSON.stringify(text)
    }
  }

  toTool(): TextResponse {
    return {
      type: 'text' as const,
      text: this.text
    }
  }

  toPrompt(): TextResponse {
    return {
      type: 'text' as const,
      text: this.text
    }
  }

  toResource(): string {
    return this.text
  }
}