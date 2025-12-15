/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../contracts/content.js'
import type { ResourceLink as ResourceLinkContent } from '../../types/jsonrpc.js'
import type { Tool } from '../tool.js'
import type { Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'
import type { ResourceContext } from '../../types/context.js'

import { createError } from '@adonisjs/core/exceptions'
import { findResource } from '../../utils/find_resource_pattern.js'

export default class ResourceLink implements Content {
  #uri: string
  #resource: Resource | null
  #meta?: Record<string, unknown>

  constructor(uri: string) {
    this.#uri = uri
    this.#resource = null
  }

  async preProcess(ctx: ResourceContext): Promise<this> {
    this.#resource = await findResource({
      uri: this.#uri,
      resourceList: ctx.resources,
      ctx,
    })

    return this
  }

  async toTool(_tool: Tool): Promise<ResourceLinkContent> {
    if (!this.#resource) {
      throw createError('Resource not found.', 'E_RESOURCE_NOT_FOUND')
    }

    return this.#mergeMeta({
      type: 'resource_link' as const,
      name: this.#resource.name,
      uri: this.#uri,
      mimeType: this.#resource.mimeType,
      title: this.#resource.title,
      description: this.#resource.description,
      size: this.#resource.size,
    })
  }

  async toPrompt(_prompt: Prompt): Promise<never> {
    throw createError(
      'Resource link content may not be used in prompts.',
      'E_RESOURCE_LINK_NOT_SUPPORTED'
    )
  }

  async toResource(_resource: Resource): Promise<never> {
    throw createError(
      'Resource link content may not be used in resources.',
      'E_RESOURCE_LINK_NOT_SUPPORTED'
    )
  }

  withMeta(meta: Record<string, unknown>): this {
    this.#meta = meta
    return this
  }

  #mergeMeta(object: ResourceLinkContent): ResourceLinkContent {
    if (this.#meta) {
      return { ...object, _meta: this.#meta }
    }

    return object
  }
}
