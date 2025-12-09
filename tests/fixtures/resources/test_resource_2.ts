/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Resource } from '../../../src/server/resource.js'
import type { ResourceContext } from '../../../src/types/context.js'

export default class TestResource2 extends Resource {
  name = 'test-resource-2'
  uri = 'file:///test-resource-2.bin'
  title = 'Test Resource 2'
  description = 'Second test resource with blob'
  mimeType = 'application/octet-stream'
  size = 200

  async handle({ response }: ResourceContext) {
    return response.blob('Hello World') // Will be base64 encoded by Blob class
  }
}
