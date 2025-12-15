/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../contracts/content.js'
import type { TextContent } from '../../types/jsonrpc.js'
import type { Resource } from '../resource.js'
import type { Tool } from '../tool.js'
import type { Prompt } from '../prompt.js'
import { createError } from '@adonisjs/core/exceptions'
import Text from './text.js'

export default class Structured implements Content {
  #object: Record<string, unknown>

  constructor(object: Record<string, unknown>) {
    this.#object = object
  }

  get structuredContent() {
    return this.#object
  }

  async toTool(_tool: Tool): Promise<TextContent> {
    return new Text(JSON.stringify(this.#object)).toTool(_tool)
  }

  async toPrompt(_prompt: Prompt): Promise<never> {
    throw createError(
      'Structured content may not be used in prompts.',
      'E_STRUCTURED_NOT_SUPPORTED'
    )
  }

  async toResource(_resource: Resource): Promise<never> {
    throw createError(
      'Structured content may not be used in resources.',
      'E_STRUCTURED_NOT_SUPPORTED'
    )
  }
}
