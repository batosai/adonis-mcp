/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Tool } from '../../../src/server/tool.js'
import type { JSONSchema } from '../../../src/types/method.js'

export default class TestTool2 extends Tool<JSONSchema> {
  name = 'test-tool-2'
  title = 'Test Tool 2'
  description = 'Second test tool'

  schema() {
    return {
      type: 'object' as const,
      properties: {
        number: {
          type: 'number' as const,
          description: 'Number input',
        },
      },
      required: [],
    }
  }

  async handle() {
    return { result: 'test' }
  }
}
