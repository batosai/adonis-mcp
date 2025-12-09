/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../contracts/content.js'
import type { AudioContent } from '../../types/jsonrpc.js'
import type { AnyTool as Tool } from '../tool.js'
import type { AnyPrompt as Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'
import { createError } from '@adonisjs/core/exceptions'

import Role from '../../enums/role.js'

export default class Audio implements Content {
  #data: string
  #mimeType: string
  #_meta?: Record<string, unknown>
  #role: Role

  constructor(data: string, mimeType: string, _meta?: Record<string, unknown>) {
    this.#data = data
    this.#mimeType = mimeType
    this.#_meta = _meta
    this.#role = Role.USER
  }

  async toTool(_tool: Tool): Promise<AudioContent> {
    return {
      type: 'audio' as const,
      data: this.#data,
      mimeType: this.#mimeType,
      _meta: this.#_meta,
    }
  }

  async toPrompt(_prompt: Prompt): Promise<AudioContent> {
    return {
      type: 'audio' as const,
      data: this.#data,
      mimeType: this.#mimeType,
      _meta: this.#_meta,
    }
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
}
