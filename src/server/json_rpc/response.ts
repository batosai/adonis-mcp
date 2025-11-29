/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import type { JsonRpcResponse as Response, ToolResponse, ResourceResponse, PromptResponse, JsonRpcResult, JsonRpcError } from '../../types/response.js'
import type { JsonRpcRequestType } from '../../types/request.js'
import type { AnyTool as Tool } from '../tool.js'
import type { Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'

export default class JsonRpcResponse {
  #requestType: JsonRpcRequestType

  #version = '2.0' as const
  #id: string | number
  #isError: boolean = false
  #content: Array<ToolResponse | ResourceResponse | PromptResponse> = []
  #result?: JsonRpcResult
  #error?: JsonRpcError
  #component?: Tool | Prompt | Resource

  constructor(
    id: string | number, 
    requestType: JsonRpcRequestType,
    component?: Tool | Prompt | Resource
  ) {
    this.#requestType = requestType
    this.#id = id
    if (component) {
      this.#component = component
    }
  }

  addContent(content: Content) {
    if (content instanceof Error) {
      this.#isError = true
    }

    let result
    if (this.#requestType === 'resource') {
      result = content.toResource(this.#component as Resource)
    } else if (this.#requestType === 'prompt') {
      result = content.toPrompt(this.#component as Prompt)
    } else {
      result = content.toTool(this.#component as Tool)
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

    // For resources, use 'contents' (plural) as per MCP spec
    const contentKey = this.#requestType === 'resource' ? 'contents' : 'content'


    return {
      jsonrpc: this.#version,
      id: this.#id,
      result: {
        [contentKey]: this.#content,
        ...(this.#isError && { error: this.#error }),
      },
      error: this.#error,
    }
  }
}