/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Tool } from '../../../src/server/tool.js'
import type { JSONSchema } from '../../../src/types/method.js'
import type { ToolContext } from '../../../src/types/context.js'

export default class TestToolWithText extends Tool<JSONSchema> {
  name = 'test-tool-with-text'
  title = 'Test Tool With Text'
  description = 'Test tool that returns text content'

  schema() {
    return {
      type: 'object' as const,
      properties: {
        message: {
          type: 'string' as const,
          description: 'Message to return',
        },
      },
      required: ['message'],
    }
  }

  async handle({ args, response }: ToolContext & { args: { message: string } }) {
    return response.text(`Response: ${args.message}`)
  }
}
