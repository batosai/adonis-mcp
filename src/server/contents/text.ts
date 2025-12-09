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

  constructor(text: string | unknown) {
    if (typeof text === 'string') {
      this.#text = text
    } else {
      this.#text = JSON.stringify(text)
    }
    this.#role = Role.USER
  }

  async toTool(_tool: Tool): Promise<TextContent> {
    return {
      type: 'text' as const,
      text: this.#text,
    }
  }

  async toPrompt(_prompt: Prompt): Promise<TextContent> {
    return {
      type: 'text' as const,
      text: this.#text,
    }
  }

  async toResource(resource: Resource): Promise<TextResourceContents> {
    return {
      text: this.#text,
      uri: resource.uri,
      mimeType: resource.mimeType,
    }
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
