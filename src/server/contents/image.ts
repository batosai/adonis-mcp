/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../contracts/content.js'
import type { ImageContent } from '../../types/jsonrpc.js'
import type { Tool } from '../tool.js'
import type { Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'
import { createError } from '@adonisjs/core/exceptions'

import Role from '../../enums/role.js'

export default class Image implements Content {
  #data: string
  #mimeType: string
  #role: Role
  #meta?: Record<string, unknown>

  constructor(data: string, mimeType: string) {
    this.#data = data
    this.#mimeType = mimeType
    this.#role = Role.USER
  }

  async toTool(_tool: Tool): Promise<ImageContent> {
    return this.#mergeMeta({
      type: 'image' as const,
      data: this.#data,
      mimeType: this.#mimeType,
    })
  }

  async toPrompt(_prompt: Prompt): Promise<ImageContent> {
    return this.#mergeMeta({
      type: 'image' as const,
      data: this.#data,
      mimeType: this.#mimeType,
    })
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

  withMeta(meta: Record<string, unknown>): this {
    this.#meta = meta
    return this
  }

  #mergeMeta(object: ImageContent): ImageContent {
    if (this.#meta) {
      return { ...object, _meta: this.#meta }
    }

    return object
  }
}
