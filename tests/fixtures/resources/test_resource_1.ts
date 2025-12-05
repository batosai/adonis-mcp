/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Resource } from '../../../src/server/resource.js'
import type { ResourceContext } from '../../../src/types/context.js'
import type { McpResourceResponse } from '../../../src/types/response.js'

export default class TestResource1 extends Resource {
  name = 'test-resource-1'
  uri = 'file:///test-resource-1.txt'
  title = 'Test Resource 1'
  description = 'First test resource'
  mimeType = 'text/plain'
  size = 100

  async handle({ response }: ResourceContext): Promise<McpResourceResponse> {
    return response.text('Hello from test resource 1')
  }
}
