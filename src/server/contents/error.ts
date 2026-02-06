/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../contracts/content.js'
import type { Prompt } from '../prompt.js'
import type { Tool } from '../tool.js'
import type { Resource } from '../resource.js'
import type { TextContent } from '../../types/jsonrpc.js'
import Text from './text.js'
import { createError } from '@adonisjs/core/exceptions'

export default class Error extends Text implements Content {
  #text?: string

  constructor(text?: string) {
    super(text)
    this.#text = text
  }

  async toTool(tool: Tool): Promise<TextContent> {
    this.#text = this.#text || 'An error occurred'
    return super.toTool(tool)
  }

  toPrompt(_prompt: Prompt): never {
    throw createError('Error content may not be used in prompts.', 'E_ERROR_NOT_SUPPORTED')
  }

  toResource(_resource: Resource): never {
    throw createError(this.#text || 'Resource not found', 'E_ERROR_NOT_FOUND')
  }
}
