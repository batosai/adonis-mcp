/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

/**
 * Helper to create mock tools for testing
 */
import { Tool } from '../../src/server/tool.js'
import type { JSONSchema } from '../../src/types/method.js'

export class MockTool extends Tool<JSONSchema> {
  constructor(
    public name: string,
    public title?: string,
    public description?: string,
    public schemaDefinition?: JSONSchema
  ) {
    super()
  }

  schema() {
    return (
      this.schemaDefinition ?? {
        type: 'object',
        properties: {},
        required: [],
      }
    )
  }

  async handle() {
    return { result: 'mock' }
  }
}

/**
 * Creates a tool module export for mocking dynamic imports
 */
export function createMockToolModule(tool: Tool<JSONSchema>) {
  return {
    default: tool.constructor as new () => Tool<JSONSchema>,
  }
}

