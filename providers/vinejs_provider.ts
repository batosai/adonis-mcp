import type {
  ToolContext,
  ResourceContext,
  PromptContext,
  CompleteContext,
} from '../src/types/context.js'
type Context = ToolContext | ResourceContext | PromptContext | CompleteContext

import McpRequest from '../src/request.js'
import { RequestValidator } from '../src/server/requests/request_validator.js'

export default class VineJSServiceProvider {
  boot() {
    ;(McpRequest as any).macro(
      'validateUsing',
      function (this: McpRequest, validator: any, options?: any) {
        return new RequestValidator(this.ctx as Context).validateUsing(validator, options)
      }
    )
  }
}

declare module '../src/types/request.js' {
  interface McpResourceRequest extends RequestValidator {}
  interface McpToolRequest extends RequestValidator {}
  interface McpPromptRequest extends RequestValidator {}
}
