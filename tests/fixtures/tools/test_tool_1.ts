/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Tool } from '../../../src/server/tool.js'
import type { JSONSchema } from '../../../src/types/method.js'

export default class TestTool1 extends Tool<JSONSchema> {
  name = 'test-tool-1'
  title = 'Test Tool 1'
  description = 'First test tool'

  schema() {
    return {
      type: 'object' as const,
      properties: {
        text: {
          type: 'string' as const,
          description: 'Text input',
        },
      },
      required: ['text'],
    }
  }

  async handle() {
    return { result: 'test' }
  }
}

