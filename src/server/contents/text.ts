/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import type { TextContent, TextResourceContent } from '../../types/content.js'
import type { AnyTool as Tool } from '../tool.js'
import type { Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'

export default class Text implements Content {
  text: string

  constructor(text: string | unknown) {
    if (typeof text === 'string') {
      this.text = text
    } else {
      this.text = JSON.stringify(text)
    }
  }

  toTool(_tool: Tool): TextContent {
    return {
      type: 'text' as const,
      text: this.text
    }
  }

  toPrompt(_prompt: Prompt): TextContent {
    return {
      type: 'text' as const,
      text: this.text
    }
  }

  toResource(_resource: Resource): TextResourceContent {
    return {
      text: this.text,
      uri: _resource.uri,
      mimeType: _resource.mimeType,
      size: _resource.size,
    }
  }
}