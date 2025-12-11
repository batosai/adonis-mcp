/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JsonRpcResponse } from './types/jsonrpc.js'
import type { McpResponse } from './types/response.js'
import type { McpRequestType } from './types/request.js'
import type { JsonRpcRequest } from './types/jsonrpc.js'

import JsonRpc from './jsonrpc/response.js'
import Text from './server/contents/text.js'
import Blob from './server/contents/blob.js'
import Image from './server/contents/image.js'
import Audio from './server/contents/audio.js'
import Structured from './server/contents/structured.js'
import ResourceLink from './server/contents/resource_link.js'
import EmbeddedResource from './server/contents/embedded_resource.js'
import Error from './server/contents/error.js'

export default class<T extends McpRequestType = McpRequestType> implements McpResponse {
  readonly type: T

  constructor(jsonRpcRequest: JsonRpcRequest) {
    if (jsonRpcRequest.method === 'resources/read') {
      this.type = 'resource' as T
    } else if (jsonRpcRequest.method === 'prompts/get') {
      this.type = 'prompt' as T
    } else {
      this.type = 'tool' as T
    }
  }

  text(text: string) {
    return new Text(text)
  }

  blob(text: string) {
    return new Blob(text)
  }

  image(data: string, mimeType: string) {
    return new Image(data, mimeType)
  }

  audio(data: string, mimeType: string) {
    return new Audio(data, mimeType)
  }

  structured(object: Record<string, unknown>) {
    return new Structured(object)
  }

  resourceLink(uri: string) {
    return new ResourceLink(uri)
  }

  embeddedResource(uri: string) {
    return new EmbeddedResource(uri)
  }

  error(message: string) {
    return new Error(message)
  }

  static toJsonRpc({ id, result, error }: Omit<JsonRpcResponse, 'jsonrpc'>): JsonRpcResponse {
    const jsonRpc = new JsonRpc(id)

    if (result) {
      jsonRpc.addResult(result)
    }
    if (error) {
      jsonRpc.addError(error)
    }
    return jsonRpc.render()
  }
}
