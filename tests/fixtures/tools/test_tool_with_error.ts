/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Tool } from '../../../src/server/tool.js'
import type { JSONSchema } from '../../../src/types/method.js'
import type { ToolContext } from '../../../src/types/context.js'

export default class TestToolWithError extends Tool<JSONSchema> {
  name = 'test-tool-with-error'
  title = 'Test Tool With Error'
  description = 'Test tool that returns error content'

  schema() {
    return {
      type: 'object' as const,
      properties: {},
      required: [],
    }
  }

  async handle({ response }: ToolContext) {
    return response.error('An error occurred')
  }
}
