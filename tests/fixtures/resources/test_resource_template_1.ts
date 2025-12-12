/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Resource } from '../../../src/server/resource.js'
import type { ResourceContext } from '../../../src/types/context.js'

export default class TestResourceTemplate1 extends Resource {
  name = 'test-resource-template-1'
  uri = 'file:///users/{id}'
  title = 'Test Resource Template 1'
  description = 'Resource template with simple variable'
  mimeType = 'text/plain'

  async handle({ response, args }: ResourceContext) {
    return response.text(`User ID: ${args?.id}`)
  }
}
