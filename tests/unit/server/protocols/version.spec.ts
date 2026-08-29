/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import { createInitializeRequest, createJsonRpcRequest } from '../../../helpers/create_request.js'
import {
  getProtocolEnvelope,
  getProtocolEra,
  MODERN_PROTOCOL_VERSION,
  SUPPORTED_PROTOCOL_VERSIONS,
} from '../../../../src/server/protocols/version.js'

test.group('Protocol version', () => {
  test('should expose modern and legacy supported versions', ({ assert }) => {
    assert.deepEqual([...SUPPORTED_PROTOCOL_VERSIONS], ['2026-07-28', '2025-11-25', '2025-06-18'])
  })

  test('should read a modern request envelope', ({ assert }) => {
    const request = createJsonRpcRequest('tools/list', {
      _meta: {
        'io.modelcontextprotocol/protocolVersion': MODERN_PROTOCOL_VERSION,
        'io.modelcontextprotocol/clientCapabilities': { elicitation: {} },
        'io.modelcontextprotocol/clientInfo': { name: 'Test Client', version: '2.0.0' },
        'io.modelcontextprotocol/logLevel': 'debug',
      },
    })

    assert.equal(getProtocolEra(request), 'modern')
    assert.deepEqual(getProtocolEnvelope(request), {
      protocolVersion: MODERN_PROTOCOL_VERSION,
      clientCapabilities: { elicitation: {} },
      clientInfo: { name: 'Test Client', version: '2.0.0' },
      logLevel: 'debug',
    })
  })

  test('should read a legacy initialize envelope', ({ assert }) => {
    const request = createInitializeRequest('2025-11-25')

    assert.equal(getProtocolEra(request), 'legacy')
    assert.equal(getProtocolEnvelope(request).protocolVersion, '2025-11-25')
  })
})
