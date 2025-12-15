/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../contracts/content.js'
import type { BlobResourceContents } from '../../types/jsonrpc.js'
import type { Resource } from '../resource.js'
import type { AnyTool as Tool } from '../tool.js'
import type { AnyPrompt as Prompt } from '../prompt.js'
import { createError } from '@adonisjs/core/exceptions'

export default class Blob implements Content {
  #text: string
  #meta?: Record<string, unknown>

  constructor(text: string | Buffer) {
    if (typeof text === 'string') {
      this.#text = Buffer.from(text).toString('base64')
    } else {
      this.#text = text.toString('base64')
    }
  }

  async toTool(_tool: Tool): Promise<never> {
    throw createError('Blob content may not be used in tools.', 'E_BLOB_NOT_SUPPORTED')
  }

  async toPrompt(_prompt: Prompt): Promise<never> {
    throw createError('Blob content may not be used in prompts.', 'E_BLOB_NOT_SUPPORTED')
  }

  async toResource(resource: Resource): Promise<BlobResourceContents> {
    return this.#mergeMeta({
      blob: this.#text,
      uri: resource.uri,
      mimeType: resource.mimeType,
    })
  }

  withMeta(meta: Record<string, unknown>): this {
    this.#meta = meta
    return this
  }

  #mergeMeta(object: BlobResourceContents): BlobResourceContents {
    if (this.#meta) {
      return { ...object, _meta: this.#meta }
    }

    return object
  }
}
