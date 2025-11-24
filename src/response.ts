/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { JsonRpcResponse, McpResponse, TextResponse, ImageResponse, AudioResponse, BlobResponse } from './types/response.js'
import type { JsonRpcRequest } from './types/request.js'
import type { Content } from './server/content.js'

import { ErrorCode } from './enums/error.js'
import Text from './server/contents/text.js'
import Blob from './server/contents/blob.js'
import Image from './server/contents/image.js'
import Audio from './server/contents/audio.js'
export default class Response implements McpResponse {
  readonly requestType: 'tool' | 'resource' | 'prompt'

  constructor(jsonRpcRequest: JsonRpcRequest) {
    if (jsonRpcRequest.method === 'resources/read') {
      this.requestType = 'resource'
    } else if (jsonRpcRequest.method === 'prompts/get') {
      this.requestType = 'prompt'
    } else {
      this.requestType = 'tool'
    }
  }

  text(text: string) {
    const textContent = new Text(text)

    let result
    if (this.requestType === 'resource') {
      result = textContent.toResource()
    } else if (this.requestType === 'prompt') {
      result = textContent.toPrompt()
    } else {
      result = textContent.toTool()
    }

    return result as this['requestType'] extends 'resource' 
    ? string 
    : TextResponse
  }

  blob(text: string) {
    const blobContent = new Blob(text)

    let result
    if (this.requestType === 'resource') {
      result = blobContent.toResource()
    } else if (this.requestType === 'prompt') {
      result = blobContent.toPrompt()
    } else {
      result = blobContent.toTool()
    }
    return result as BlobResponse
  }

  image(data: string, mimeType: string, _meta?: Record<string, unknown>) {
    const imageContent = new Image(data, mimeType, _meta)
    let result
    if (this.requestType === 'resource') {
      result = imageContent.toResource()
    } else if (this.requestType === 'prompt') {
      result = imageContent.toPrompt()
    } else {
      result = imageContent.toTool()
    }
    return result as ImageResponse
  }

  audio(data: string, mimeType: string, _meta?: Record<string, unknown>) {
    const audioContent = new Audio(data, mimeType, _meta)
    let result
    if (this.requestType === 'resource') {
      result = audioContent.toResource()
    } else if (this.requestType === 'prompt') {
      result = audioContent.toPrompt()
    } else {
      result = audioContent.toTool()
    }
    return result as AudioResponse
  }

  error(message: string, code?: number, data?: Record<string, unknown>) {
    return {
      message,
      code: code ?? ErrorCode.InternalError,
      data,
    }
  }

  send(content: Content | Array<Content>) {
    if (!Array.isArray(content)) {
      content = [content]
    }

    return content.map((c) => {
      if (this.requestType === 'tool') {
        return c.toTool()
      } else if (this.requestType === 'resource') {
        return c.toResource()
      } else {
        return c.toPrompt()
      }
    }) as this['requestType'] extends 'resource' 
    ? string[] 
    : Array<TextResponse | ImageResponse | AudioResponse>
  }

  static toJsonRpc({ id, result, error }: Omit<JsonRpcResponse, 'jsonrpc'>): JsonRpcResponse {
    return {
      jsonrpc: '2.0',
      id,
      result,
      error,
    } as const
  }
}
