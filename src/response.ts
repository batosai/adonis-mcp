/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JsonRpcResponse, McpResponse, TextResponse, ImageResponse, AudioResponse, BlobResponse, ErrorResponse } from './types/response.js'
import type { JsonRpcRequest } from './types/request.js'
import type { Content } from './server/content.js'

import JsonRpc from './server/json_rpc/response.js'
import Text from './server/contents/text.js'
import Blob from './server/contents/blob.js'
import Image from './server/contents/image.js'
import Audio from './server/contents/audio.js'
import Error from './server/contents/error.js'
export default class Response implements McpResponse {
  readonly requestType: 'tool' | 'resource' | 'prompt'
  #jsonRpc: JsonRpc

  constructor(jsonRpcRequest: JsonRpcRequest) {
    if (jsonRpcRequest.method === 'resources/read') {
      this.requestType = 'resource'
    } else if (jsonRpcRequest.method === 'prompts/get') {
      this.requestType = 'prompt'
    } else {
      this.requestType = 'tool'
    }
    this.#jsonRpc = new JsonRpc(jsonRpcRequest.id, this.requestType)
  }

  text(text: string) {
    const textContent = new Text(text)
    this.#jsonRpc
      .addContent(textContent) as this['requestType'] extends 'resource' 
        ? string 
        : TextResponse

    return this
  }

  blob(text: string) {
    const blobContent = new Blob(text)
    this.#jsonRpc
      .addContent(blobContent) as BlobResponse

    return this
  }

  image(data: string, mimeType: string, _meta?: Record<string, unknown>) {
    const imageContent = new Image(data, mimeType, _meta)
    this.#jsonRpc
      .addContent(imageContent) as ImageResponse

    return this
  }

  audio(data: string, mimeType: string, _meta?: Record<string, unknown>) {
    const audioContent = new Audio(data, mimeType, _meta)
    this.#jsonRpc
      .addContent(audioContent) as AudioResponse

    return this
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

  error(message: string) {
    const errorContent = new Error(message)
    this.#jsonRpc
      .addContent(errorContent) as ErrorResponse

    return this
  }

  send(content: Content | Array<Content>) {
    if (!Array.isArray(content)) {
      content = [content]
    }
    content.forEach((c) => this.#jsonRpc.addContent(c))

    return this
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
