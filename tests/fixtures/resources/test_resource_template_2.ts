/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Resource } from '../../../src/server/resource.js'
import type { ResourceContext } from '../../../src/types/context.js'

export default class TestResourceTemplate2 extends Resource {
  name = 'test-resource-template-2'
  uri = 'file:///api{?page,limit}'
  title = 'Test Resource Template 2'
  description = 'Resource template with query parameters'
  mimeType = 'application/json'

  async handle({ response, args }: ResourceContext) {
    return response.text(`Page: ${args?.page}, Limit: ${args?.limit}`)
  }
}
