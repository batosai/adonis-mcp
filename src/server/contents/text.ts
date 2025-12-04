/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import type { TextBuilder, TextResourceBuilder } from '../../types/jsonrpc.js'
import type { AnyTool as Tool } from '../tool.js'
import type { AnyPrompt as Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'

export default class Text implements Content {
  text: string
  role: 'assistant' | 'user'

  constructor(text: string | unknown) {
    if (typeof text === 'string') {
      this.text = text
    } else {
      this.text = JSON.stringify(text)
    }
    this.role = 'user'
  }

  toTool(_tool: Tool): TextBuilder {
    return {
      type: 'text' as const,
      text: this.text
    }
  }

  toPrompt(_prompt: Prompt): TextBuilder {
    return {
      type: 'text' as const,
      text: this.text
    }
  }

  toResource(_resource: Resource): TextResourceBuilder {
    return {
      text: this.text,
      uri: _resource.uri,
      mimeType: _resource.mimeType,
      size: _resource.size,
    }
  }

  asAssistant(): this {
    this.role = 'assistant'
    return this
  }

  asUser(): this {
    this.role = 'user'
    return this
  }
}