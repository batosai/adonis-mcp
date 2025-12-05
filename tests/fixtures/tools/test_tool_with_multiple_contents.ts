/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Tool } from '../../../src/server/tool.js'
import type { JSONSchema } from '../../../src/types/method.js'
import type { ToolContext } from '../../../src/types/context.js'

export default class TestToolWithMultipleContents extends Tool<JSONSchema> {
  name = 'test-tool-with-multiple-contents'
  title = 'Test Tool With Multiple Contents'
  description = 'Test tool that returns multiple content items'

  schema() {
    return {
      type: 'object' as const,
      properties: {},
      required: [],
    }
  }

  async handle({ response }: ToolContext) {
    return [response.text('First message'), response.text('Second message')]
  }
}
