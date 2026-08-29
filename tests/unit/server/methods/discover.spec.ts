/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import Discover from '../../../../src/server/methods/discover.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createJsonRpcRequest } from '../../../helpers/create_request.js'

test.group('Discover Method', () => {
  test('should advertise supported versions and server identity', ({ assert }) => {
    const request = createJsonRpcRequest('server/discover', {
      _meta: {
        'io.modelcontextprotocol/protocolVersion': '2026-07-28',
        'io.modelcontextprotocol/clientCapabilities': {},
      },
    })
    const context = createTestContext(request, {
      supportedProtocolVersions: ['2026-07-28', '2025-11-25', '2025-06-18'],
    })

    const response = new Discover().handle(context)

    assert.deepEqual(response.result?.supportedVersions, ['2026-07-28', '2025-11-25', '2025-06-18'])
    assert.equal(response.result?.resultType, 'complete')
    assert.equal(response.result?.ttlMs, 0)
    assert.equal(response.result?.cacheScope, 'private')
    assert.deepEqual(response.result?._meta, {
      'io.modelcontextprotocol/serverInfo': {
        name: 'Test MCP Server',
        version: '1.0.0',
      },
    })
  })
})
