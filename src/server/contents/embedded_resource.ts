/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../contracts/content.js'
import type { EmbeddedResource as EmbeddedResourceContent } from '../../types/jsonrpc.js'
import type { AnyTool as Tool } from '../tool.js'
import type { AnyPrompt as Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'
import type { ResourceList } from '../../types/method.js'
import type { ResourceContext } from '../../types/context.js'

import { createError } from '@adonisjs/core/exceptions'

export default class EmbeddedResource implements Content {
  #uri: string
  #resource?: Resource
  #role: 'assistant' | 'user'
  #ctx?: ResourceContext
  #meta?: Record<string, unknown>

  constructor(uri: string) {
    this.#uri = uri
    this.#role = 'user'
  }

  async preProcess(resourceList: ResourceList, ctx: ResourceContext): Promise<this> {
    this.#ctx = ctx
    const item = resourceList[this.#uri]

    if (!item) {
      throw createError(`Resource ${this.#uri} not found.`, 'E_RESOURCE_NOT_FOUND')
    }

    const { default: Resource } = await import(item)
    this.#resource = new Resource()

    return this
  }

  async toTool(_tool: Tool): Promise<EmbeddedResourceContent> {
    if (!this.#resource) {
      throw createError('Resource not found.', 'E_RESOURCE_NOT_FOUND')
    }
    const content = await this.#resource.handle(this.#ctx)

    return this.#mergeMeta({
      type: 'resource' as const,
      resource: await content.toResource(this.#resource),
    })
  }

  async toPrompt(_prompt: Prompt): Promise<EmbeddedResourceContent> {
    if (!this.#resource) {
      throw createError('Resource not found.', 'E_RESOURCE_NOT_FOUND')
    }
    const content = await this.#resource.handle(this.#ctx)

    return this.#mergeMeta({
      type: 'resource' as const,
      resource: await content.toResource(this.#resource),
    })
  }

  async toResource(_resource: Resource): Promise<never> {
    throw createError(
      'Embedded resource content may not be used in resources.',
      'E_EMBEDDED_RESOURCE_NOT_SUPPORTED'
    )
  }

  asAssistant(): this {
    this.#role = 'assistant'
    return this
  }

  asUser(): this {
    this.#role = 'user'
    return this
  }

  get role() {
    return this.#role
  }

  withMeta(meta: Record<string, unknown>): this {
    this.#meta = meta
    return this
  }

  #mergeMeta(object: EmbeddedResourceContent): EmbeddedResourceContent {
    if (this.#meta) {
      return { ...object, _meta: this.#meta }
    }

    return object
  }
}
