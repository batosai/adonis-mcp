/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../contracts/content.js'
import type { TextContent, TextResourceContents } from '../../types/jsonrpc.js'
import type { AnyTool as Tool } from '../tool.js'
import type { AnyPrompt as Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'

import Role from '../../enums/role.js'

export default class Text implements Content {
  #text: string
  #role: Role
  #meta?: Record<string, unknown>

  constructor(text: string | unknown) {
    if (typeof text === 'string') {
      this.#text = text
    } else {
      this.#text = JSON.stringify(text)
    }
    this.#role = Role.USER
  }

  async toTool(_tool: Tool): Promise<TextContent> {
    return this.#mergeMeta({
      type: 'text' as const,
      text: this.#text,
    }) as TextContent
  }

  async toPrompt(_prompt: Prompt): Promise<TextContent> {
    return this.#mergeMeta({
      type: 'text' as const,
      text: this.#text,
    }) as TextContent
  }

  async toResource(resource: Resource): Promise<TextResourceContents> {
    return this.#mergeMeta({
      text: this.#text,
      uri: resource.uri,
      mimeType: resource.mimeType,
    }) as TextResourceContents
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

  #mergeMeta(object: TextContent | TextResourceContents): TextContent | TextResourceContents {
    if (this.#meta) {
      return { ...object, _meta: this.#meta }
    }

    return object
  }
}
