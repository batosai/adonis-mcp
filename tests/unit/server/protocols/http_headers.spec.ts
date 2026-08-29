/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import { createTestContext } from '../../../helpers/create_context.js'
import { createJsonRpcRequest } from '../../../helpers/create_request.js'
import { validateModernHttpHeaders } from '../../../../src/server/protocols/http_headers.js'
import { ErrorCode } from '../../../../src/enums/error.js'

function modernRequest(method: string, params: Record<string, unknown> = {}) {
  return createJsonRpcRequest(method, {
    ...params,
    _meta: {
      'io.modelcontextprotocol/protocolVersion': '2026-07-28',
      'io.modelcontextprotocol/clientCapabilities': {},
    },
  })
}

function readHeaders(headers: Record<string, string>) {
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value])
  )
  return (name: string) => normalized[name.toLowerCase()]
}

test.group('Modern HTTP headers', () => {
  test('should accept matching standard headers', ({ assert }) => {
    const request = modernRequest('tools/call', { name: 'search', arguments: {} })
    const context = createTestContext(request)

    assert.doesNotThrow(() =>
      validateModernHttpHeaders(
        request,
        context,
        readHeaders({
          'MCP-Protocol-Version': '2026-07-28',
          'Mcp-Method': 'tools/call',
          'Mcp-Name': 'search',
        })
      )
    )
  })

  test('should reject a missing or mismatched standard header', ({ assert }) => {
    const request = modernRequest('resources/read', { uri: 'file:///test.txt' })
    const context = createTestContext(request)

    try {
      validateModernHttpHeaders(
        request,
        context,
        readHeaders({
          'MCP-Protocol-Version': '2026-07-28',
          'Mcp-Method': 'resources/read',
          'Mcp-Name': 'file:///other.txt',
        })
      )
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.HeaderMismatch)
      assert.equal(error.requestId, request.id)
    }
  })

  test('should validate tool parameters exposed as headers', ({ assert }) => {
    const request = modernRequest('tools/call', {
      name: 'search',
      arguments: { region: 'eu west' },
    })
    const context = createTestContext(request, {
      tools: {
        search: {
          path: '/test/search.js',
          json: {
            inputSchema: {
              type: 'object',
              properties: {
                region: { 'type': 'string', 'x-mcp-header': 'Region' },
              },
            },
          },
        },
      },
    })

    assert.doesNotThrow(() =>
      validateModernHttpHeaders(
        request,
        context,
        readHeaders({
          'MCP-Protocol-Version': '2026-07-28',
          'Mcp-Method': 'tools/call',
          'Mcp-Name': 'search',
          'Mcp-Param-Region': '=?base64?ZXUgd2VzdA==?=',
        })
      )
    )
  })

  test('should leave legacy requests unchanged', ({ assert }) => {
    const request = createJsonRpcRequest('tools/list')
    const context = createTestContext(request)

    assert.doesNotThrow(() => validateModernHttpHeaders(request, context, readHeaders({})))
  })
})
