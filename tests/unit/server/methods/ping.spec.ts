/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import Ping from '../../../../src/server/methods/ping.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createPingRequest } from '../../../helpers/create_request.js'

test.group('Ping Method', () => {
  test('should handle ping request successfully', async ({ assert }) => {
    const request = createPingRequest()
    const context = createTestContext(request)
    const method = new Ping()

    const response = method.handle(context)

    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.deepEqual(response.result, {})
    assert.notExists(response.error)
  })

  test('should return correct id in response', async ({ assert }) => {
    const request = createPingRequest(42)
    const context = createTestContext(request)
    const method = new Ping()

    const response = method.handle(context)

    assert.equal(response.id, 42)
    assert.equal(response.jsonrpc, '2.0')
    assert.exists(response.result)
  })
})

