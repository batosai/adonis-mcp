/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Resource } from '../../../src/server/resource.js'
import type { ResourceContext } from '../../../src/types/context.js'

export default class TestResourceTemplate3 extends Resource {
  name = 'test-resource-template-3'
  uri = 'file:///users/{userId}/posts/{postId}'
  title = 'Test Resource Template 3'
  description = 'Resource template with multiple path variables'
  mimeType = 'text/plain'

  async handle({ response, args }: ResourceContext) {
    return response.text(`User: ${args?.userId}, Post: ${args?.postId}`)
  }
}
