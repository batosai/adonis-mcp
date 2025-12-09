/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../contracts/content.js'
import type { ImageContent } from '../../types/jsonrpc.js'
import type { AnyTool as Tool } from '../tool.js'
import type { AnyPrompt as Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'
import { createError } from '@adonisjs/core/exceptions'

import Role from '../../enums/role.js'

export default class Image implements Content {
  #data: string
  #mimeType: string
  #role: Role
  #_meta?: Record<string, unknown>

  constructor(data: string, mimeType: string, _meta?: Record<string, unknown>) {
    this.#data = data
    this.#mimeType = mimeType
    this.#_meta = _meta
    this.#role = Role.USER
  }

  async toTool(_tool: Tool): Promise<ImageContent> {
    return {
      type: 'image' as const,
      data: this.#data,
      mimeType: this.#mimeType,
      _meta: this.#_meta,
    }
  }

  async toPrompt(_prompt: Prompt): Promise<ImageContent> {
    return {
      type: 'image' as const,
      data: this.#data,
      mimeType: this.#mimeType,
      _meta: this.#_meta,
    }
  }

  async toResource(_resource: Resource): Promise<never> {
    throw createError('Image content may not be used in resources.', 'E_IMAGE_NOT_SUPPORTED')
  }

  asAssistant(): this {
    this.#role = Role.ASSISTANT
    return this
  }

  asUser(): this {
    this.#role = Role.USER
    return this
  }

  get role() {
    return this.#role
  }
}
