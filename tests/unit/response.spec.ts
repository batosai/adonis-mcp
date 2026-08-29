/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import Response from '../../src/response.js'

test.group('Response', () => {
  test('should preserve result metadata authored by a handler', ({ assert }) => {
    const response = Response.forProtocol(
      Response.toJsonRpc({
        id: 1,
        result: {
          _meta: {
            'io.modelcontextprotocol/serverInfo': {
              name: 'Custom Server',
              version: '3.0.0',
            },
            'custom': true,
          },
        },
      }),
      { era: 'modern', serverName: 'Default Server', serverVersion: '2.0.0' }
    )

    assert.deepEqual(response.result?._meta, {
      'io.modelcontextprotocol/serverInfo': {
        name: 'Custom Server',
        version: '3.0.0',
      },
      'custom': true,
    })
  })

  test('should not decorate errors', ({ assert }) => {
    const response = Response.forProtocol(
      Response.toJsonRpc({ id: 1, error: { code: -32600, message: 'Invalid request' } }),
      { era: 'modern', serverName: 'Test Server', serverVersion: '2.0.0' }
    )

    assert.isUndefined(response.result)
    assert.exists(response.error)
  })
})
