/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JsonRpcResponse, McpResponse, ResponseType, TextResponseType, MediaResponseType, McpToolResponse, McpResourceResponse } from './types/response.js'
import type { JsonRpcRequest, McpRequestType } from './types/request.js'
import type { Content } from './server/content.js'

import JsonRpc from './server/json_rpc/response.js'
import Text from './server/contents/text.js'
import Blob from './server/contents/blob.js'
import Image from './server/contents/image.js'
import Audio from './server/contents/audio.js'
import Error from './server/contents/error.js'

export default class Response<T extends McpRequestType = McpRequestType> implements McpResponse {
  readonly type: T
  #jsonRpc: JsonRpc

  constructor(jsonRpcRequest: JsonRpcRequest) {
    if (jsonRpcRequest.method === 'resources/read') {
      this.type = 'resource' as T
    } else if (jsonRpcRequest.method === 'prompts/get') {
      this.type = 'prompt' as T
    } else {
      this.type = 'tool' as T
    }
    this.#jsonRpc = new JsonRpc(jsonRpcRequest.id, this.type)
  }

  text(text: string): TextResponseType<T> {
    const textContent = new Text(text)
    this.#jsonRpc.addContent(textContent)
    return this as unknown as TextResponseType<T>
  }

  blob(text: string): McpResourceResponse {
    const blobContent = new Blob(text)
    this.#jsonRpc.addContent(blobContent)
    return this as unknown as McpResourceResponse
  }

  image(data: string, mimeType: string, _meta?: Record<string, unknown>): MediaResponseType<T> {
    const imageContent = new Image(data, mimeType, _meta)
    this.#jsonRpc.addContent(imageContent)
    return this as unknown as MediaResponseType<T>
  }

  audio(data: string, mimeType: string, _meta?: Record<string, unknown>): MediaResponseType<T> {
    const audioContent = new Audio(data, mimeType, _meta)
    this.#jsonRpc.addContent(audioContent)
    return this as unknown as MediaResponseType<T>
  }

  resource() {
    // TODO a definir mais utile car resource, prompt et tool en aurons besoin
    // {
    //   type: 'resource' as const,
    //   name: string,
    //   title: string,
    //   uri: string,
    //   mimeType: string,
    // }
    // peut etre definir des method static, resource, prompt et tool.
  }

  // resourceLink() {
  // embeddedResource() {

  error(message: string): McpToolResponse {
    const errorContent = new Error(message)
    this.#jsonRpc.addContent(errorContent)
    return this as McpToolResponse
  }

  send(content: Content | Array<Content>): ResponseType<T> {
    if (!Array.isArray(content)) {
      content = [content]
    }
    content.forEach((c) => this.#jsonRpc.addContent(c))
    return this as unknown as ResponseType<T>
  }

  render() {
    return this.#jsonRpc.render()
  }

  static toJsonRpc({ id, result, error }: Omit<JsonRpcResponse, 'jsonrpc'>): JsonRpcResponse {
    const jsonRpc = new JsonRpc(id, 'system')

    if (result) {
      jsonRpc.addResult(result)
    }
    if (error) {
      jsonRpc.addError(error)
    }
    return jsonRpc.render()
  }
}
