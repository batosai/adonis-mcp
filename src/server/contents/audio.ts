/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../contracts/content.js'
import type { AudioContent } from '../../types/jsonrpc.js'
import type { Tool } from '../tool.js'
import type { Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'
import { createError } from '@adonisjs/core/exceptions'

import Role from '../../enums/role.js'

export default class Audio implements Content {
  #data: string
  #mimeType: string
  #meta?: Record<string, unknown>
  #role: Role

  constructor(data: string, mimeType: string) {
    this.#data = data
    this.#mimeType = mimeType
    this.#role = Role.USER
  }

  async toTool(_tool: Tool): Promise<AudioContent> {
    return this.#mergeMeta({
      type: 'audio' as const,
      data: this.#data,
      mimeType: this.#mimeType,
    })
  }

  async toPrompt(_prompt: Prompt): Promise<AudioContent> {
    return this.#mergeMeta({
      type: 'audio' as const,
      data: this.#data,
      mimeType: this.#mimeType,
    })
  }

  async toResource(_resource: Resource): Promise<never> {
    throw createError('Audio content may not be used in resources.', 'E_AUDIO_NOT_SUPPORTED')
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

  #mergeMeta(object: AudioContent): AudioContent {
    if (this.#meta) {
      return { ...object, _meta: this.#meta }
    }

    return object
  }
}
