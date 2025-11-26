/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import type { JsonRpcResponse as Response } from '../../types/response.js'
import type { ToolResponse, ResourceResponse, PromptResponse, JsonRpcResult, JsonRpcError } from '../../types/response.js'

export default class JsonRpcResponse {
  #requestType: 'tool' | 'resource' | 'prompt' | 'system'

  #version = '2.0' as const
  #id: string | number
  #isError: boolean = false
  #content: Array<ToolResponse | ResourceResponse | PromptResponse> = []
  #result?: JsonRpcResult
  #error?: JsonRpcError

  constructor(id: string | number, requestType: 'tool' | 'resource' | 'prompt' | 'system') {
    this.#requestType = requestType
    this.#id = id
  }

  addContent(content: Content) {
    if (content instanceof Error) {
      this.#isError = true
    }

    let result
    if (this.#requestType === 'resource') {
      result = content.toResource()
    } else if (this.#requestType === 'prompt') {
      result = content.toPrompt()
    } else {
      result = content.toTool()
    }

    this.#content.push(result)
    return result
  }

  addResult(result: JsonRpcResult) {
    this.#result = result
  }

  addError(error: JsonRpcError) {
    this.#error = error
  }

  render(): Response {
    if (this.#requestType === 'system') {
      return {
        jsonrpc: this.#version,
        id: this.#id,
        result: this.#result,
        error: this.#error,
      } as const
    }

    return {
      jsonrpc: this.#version,
      id: this.#id,
      result: {
        content: this.#content,
        ...(this.#isError && { error: this.#error }),
      },
      error: this.#error,
    }
  }
}