/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { HttpContext } from '@adonisjs/core/http'

import { test } from '@japa/runner'
import Server from '../../../../src/server.js'
import HttpTransport from '../../../../src/server/transports/http_transport.js'
import { createJsonRpcRequest } from '../../../helpers/create_request.js'
import { ErrorCode } from '../../../../src/enums/error.js'

function createHttpContext(headers: Record<string, string>) {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value])
  )
  const state: { status?: number; body?: unknown } = {}
  const response = {
    status(status: number) {
      state.status = status
      return response
    },
    json(body: unknown) {
      state.body = body
    },
  }
  const ctx = {
    request: {
      header(name: string) {
        return normalizedHeaders[name.toLowerCase()]
      },
    },
    response,
  } as unknown as HttpContext

  return { ctx, state }
}

function modernRequest(version = '2026-07-28') {
  return createJsonRpcRequest('tools/list', {
    _meta: {
      'io.modelcontextprotocol/protocolVersion': version,
      'io.modelcontextprotocol/clientCapabilities': {},
    },
  })
}

test.group('HttpTransport', () => {
  test('should serve a stateless modern request', async ({ assert }) => {
    const request = modernRequest()
    const { ctx, state } = createHttpContext({
      'MCP-Protocol-Version': '2026-07-28',
      'Mcp-Method': 'tools/list',
    })

    await new Server({}).handle(request, new HttpTransport(ctx))

    assert.isUndefined(state.status)
    assert.equal((state.body as any).result.resultType, 'complete')
    assert.equal((state.body as any).result.cacheScope, 'private')
  })

  test('should return HTTP 400 for a header mismatch', async ({ assert }) => {
    const request = modernRequest()
    const { ctx, state } = createHttpContext({
      'MCP-Protocol-Version': '2026-07-28',
      'Mcp-Method': 'resources/list',
    })

    await new Server({}).handle(request, new HttpTransport(ctx))

    assert.equal(state.status, 400)
    assert.equal((state.body as any).error.code, ErrorCode.HeaderMismatch)
  })

  test('should return HTTP 400 for an unsupported version', async ({ assert }) => {
    const request = modernRequest('2027-01-01')
    const { ctx, state } = createHttpContext({
      'MCP-Protocol-Version': '2027-01-01',
      'Mcp-Method': 'tools/list',
    })

    await new Server({}).handle(request, new HttpTransport(ctx))

    assert.equal(state.status, 400)
    assert.equal((state.body as any).error.code, ErrorCode.UnsupportedProtocolVersion)
  })
})
