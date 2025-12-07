/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import type { ResourceLink as ResourceLinkContent } from '../../types/jsonrpc.js'
import type { AnyTool as Tool } from '../tool.js'
import type { AnyPrompt as Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'
import type { ResourceList } from '../../types/method.js'

import { createError } from '@adonisjs/core/exceptions'

export default class ResourceLink implements Content {
  #uri: string
  #resource: Resource | null

  constructor(uri: string) {
    this.#uri = uri
    this.#resource = null
  }

  async preProcess(resourceList: ResourceList): Promise<this> {
    const item = resourceList[this.#uri]

    if (!item) {
      throw createError(`Resource ${this.#uri} not found.`, 'E_RESOURCE_NOT_FOUND')
    }

    const { default: Resource } = await import(item)
    this.#resource = new Resource()

    return this
  }

  async toTool(_tool: Tool): Promise<ResourceLinkContent> {
    if (!this.#resource) {
      throw createError('Resource not found.', 'E_RESOURCE_NOT_FOUND')
    }

    return {
      type: 'resource_link' as const,
      name: this.#resource.name,
      uri: this.#uri,
      mimeType: this.#resource.mimeType,
      title: this.#resource.title,
      description: this.#resource.description,
      size: this.#resource.size,
    }
  }

  async toPrompt(_prompt: Prompt): Promise<never> {
    throw createError('Resource link content may not be used in prompts.', 'E_RESOURCE_LINK_NOT_SUPPORTED')
  }

  async toResource(_resource: Resource): Promise<never> {
    throw createError('Resource link content may not be used in resources.', 'E_RESOURCE_LINK_NOT_SUPPORTED')
  }
}
