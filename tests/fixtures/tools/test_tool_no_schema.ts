/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Tool } from '../../../src/server/tool.js'
import type { JSONSchema } from '../../../src/types/method.js'

// Tool without schema method - tests the default behavior when schema is not defined
export default class TestToolNoSchema extends Tool<JSONSchema> {
  name = 'test-tool-no-schema'
  title = 'Test Tool No Schema'
  description = 'Tool without schema'

  // Note: schema() is optional in Tool, but TypeScript requires it to be declared
  // We use a type assertion to satisfy the compiler while keeping it truly optional
  declare schema?: () => JSONSchema

  async handle() {
    return { result: 'test' }
  }
}
