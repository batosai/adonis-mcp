/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ResourceContext } from '../types/context.js'
import type { ResourceList } from '../types/method.js'

import { UriTemplate } from './uri_template.js'
import { ErrorCode } from '../enums/error.js'
import JsonRpcException from '../server/exceptions/jsonrpc_exception.js'

export function findResourcePattern({uri, resourceList, ctx}: {uri: string, resourceList: ResourceList, ctx?: ResourceContext}) {
  return Object.keys(resourceList).find((key) => {
    if (key === uri) {
      return true
    }

    const uriTemplate = new UriTemplate(key)
    const variables = uriTemplate.match(uri as string)
    if (variables) {
      if (ctx) {
        ;(ctx as any).args = variables ?? {}
      }
      return true
    }
  })
}


export async function findResource({uri, resourceList, ctx}: {uri: string, resourceList: ResourceList, ctx: ResourceContext}) {
  const key = findResourcePattern({uri, resourceList, ctx})

  if (!key) {
    throw new JsonRpcException(
      `The resource ${uri} was not found.`,
      ErrorCode.MethodNotFound,
      ctx.request.id
    )
  }

  const { default: Resource } = await import(resourceList[key])

  const resource = new Resource(ctx)
  resource.uri = uri

  return resource
}