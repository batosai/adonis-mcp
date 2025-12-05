/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import type { BlobResourceBuilder } from '../../types/jsonrpc.js'
import type { Resource } from '../resource.js'
import type { AnyTool as Tool } from '../tool.js'
import type { AnyPrompt as Prompt } from '../prompt.js'
import { createError } from '@adonisjs/core/exceptions'

export default class Blob implements Content {
  #text: string

  constructor(text: string | Buffer) {
    if (typeof text === 'string') {
      this.#text = Buffer.from(text).toString('base64')
    } else {
      this.#text = text.toString('base64')
    }
  }

  toTool(_tool: Tool): never {
    throw createError('Blob content may not be used in tools.', 'E_BLOB_NOT_SUPPORTED')
  }

  toPrompt(_prompt: Prompt): never {
    throw createError('Blob content may not be used in prompts.', 'E_BLOB_NOT_SUPPORTED')
  }

  toResource(resource: Resource): BlobResourceBuilder {
    return {
      blob: this.#text,
      uri: resource.uri,
      mimeType: resource.mimeType,
      size: resource.size,
    }
  }
}
