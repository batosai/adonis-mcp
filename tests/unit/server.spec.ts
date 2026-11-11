/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import Server from '../../src/server.js'
import FakeTransport from '../../src/server/transports/fake_transport.js'
import { createJsonRpcRequest, createInitializeRequest } from '../helpers/create_request.js'
import { ErrorCode } from '../../src/enums/error.js'
import type { McpConfig } from '../../src/types/config.js'

test.group('Server', () => {
  test('should create server with default values', ({ assert }) => {
    const config: McpConfig = {}
    const server = new Server(config)

    assert.equal(server.name, 'AdonisJS MCP Server')
    assert.equal(server.version, '1.0.0')
    assert.equal(
      server.instructions,
      'This MCP server lets AI agents interact with our AdonisJS application.'
    )
    assert.equal(server.maxPaginationLength, 50)
    assert.equal(server.defaultPaginationLength, 15)
  })

  test('should create server with custom config', ({ assert }) => {
    const config: McpConfig = {
      name: 'Custom Server',
      version: '2.0.0',
      instructions: 'Custom instructions',
      maxPaginationLength: 100,
      defaultPaginationLength: 20,
      cache: {
        tools: { ttlMs: 60_000, scope: 'public' },
      },
    }
    const server = new Server(config)

    assert.equal(server.name, 'Custom Server')
    assert.equal(server.version, '2.0.0')
    assert.equal(server.instructions, 'Custom instructions')
    assert.equal(server.maxPaginationLength, 100)
    assert.equal(server.defaultPaginationLength, 20)
    assert.deepEqual(server.cache.tools, { ttlMs: 60_000, cacheScope: 'public' })
  })

  test('should add tool to server', ({ assert }) => {
    const server = new Server({})
    server.addTool({ 'test-tool': { path: '/path/to/tool', json: {} } })

    assert.exists(server.tools['test-tool'])
    assert.deepEqual(server.tools['test-tool'], { path: '/path/to/tool', json: {} })
  })

  test('should add resource to server', ({ assert }) => {
    const server = new Server({})
    server.addResource({ 'test-resource': { path: '/path/to/resource', json: {} } })

    assert.exists(server.resources['test-resource'])
    assert.deepEqual(server.resources['test-resource'], { path: '/path/to/resource', json: {} })
  })

  test('should add prompt to server', ({ assert }) => {
    const server = new Server({})
    server.addPrompt({ 'test-prompt': { path: '/path/to/prompt', json: {} } })

    assert.exists(server.prompts['test-prompt'])
    assert.deepEqual(server.prompts['test-prompt'], { path: '/path/to/prompt', json: {} })
  })

  test('should add capability to server', ({ assert }) => {
    const server = new Server({})
    server.addCapability('tools.listChanged', true)

    assert.equal(server.capabilities.tools.listChanged, true)
  })

  test('should connect transport', async ({ assert }) => {
    const server = new Server({})
    const transport = new FakeTransport()

    await server.connect(transport)

    // Transport should be connected (we can't directly check private field, but handle should work)
    assert.isTrue(true)
  })

  test('should handle initialize request', async ({ assert }) => {
    const server = new Server({})
    const transport = new FakeTransport()
    await server.connect(transport)

    const request = createInitializeRequest()
    await server.handle(request)

    const lastMessage = transport.getLastMessage()
    assert.exists(lastMessage)
    assert.equal(lastMessage?.id, request.id)
    assert.exists(lastMessage?.result)
    assert.equal(lastMessage?.result?.protocolVersion, '2025-06-18')
  })

  test('should throw error when handling request without transport', async ({ assert }) => {
    const server = new Server({})
    const request = createJsonRpcRequest('initialize')

    try {
      await server.handle(request)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, 'E_NO_TRANSPORT_CONNECTED')
    }
  })

  test('should throw error for unknown method', async ({ assert }) => {
    const server = new Server({})
    const transport = new FakeTransport()
    await server.connect(transport)

    const request = createJsonRpcRequest('unknown/method')
    await server.handle(request)

    const lastMessage = transport.getLastMessage()
    assert.exists(lastMessage?.error)
    assert.equal(lastMessage?.error?.code, ErrorCode.MethodNotFound)
  })

  test('should handle modern server discovery', async ({ assert }) => {
    const server = new Server({})
    const transport = new FakeTransport()
    const request = createJsonRpcRequest('server/discover', {
      _meta: {
        'io.modelcontextprotocol/protocolVersion': '2026-07-28',
        'io.modelcontextprotocol/clientCapabilities': {},
      },
    })

    await server.handle(request, transport)

    assert.deepEqual(transport.getLastMessage()?.result?.supportedVersions, [
      '2026-07-28',
      '2025-11-25',
      '2025-06-18',
    ])
  })

  test('should decorate modern results without changing legacy results', async ({ assert }) => {
    const server = new Server({ name: 'Test Server', version: '2.0.0' })
    const modernTransport = new FakeTransport()
    const legacyTransport = new FakeTransport()
    const modernRequest = createJsonRpcRequest('tools/list', {
      _meta: {
        'io.modelcontextprotocol/protocolVersion': '2026-07-28',
        'io.modelcontextprotocol/clientCapabilities': {},
      },
    })

    await server.handle(modernRequest, modernTransport)
    await server.handle(createJsonRpcRequest('tools/list'), legacyTransport)

    assert.equal(modernTransport.getLastMessage()?.result?.resultType, 'complete')
    assert.deepEqual(modernTransport.getLastMessage()?.result?._meta, {
      'io.modelcontextprotocol/serverInfo': {
        name: 'Test Server',
        version: '2.0.0',
      },
    })
    assert.equal(modernTransport.getLastMessage()?.result?.ttlMs, 0)
    assert.equal(modernTransport.getLastMessage()?.result?.cacheScope, 'private')
    assert.notProperty(legacyTransport.getLastMessage()?.result ?? {}, 'resultType')
    assert.notProperty(legacyTransport.getLastMessage()?.result ?? {}, '_meta')
    assert.notProperty(legacyTransport.getLastMessage()?.result ?? {}, 'ttlMs')
  })

  test('should apply configured cache hints to modern results', async ({ assert }) => {
    const server = new Server({
      cache: {
        tools: { ttlMs: 60_000, scope: 'public' },
      },
    })
    const transport = new FakeTransport()
    const request = createJsonRpcRequest('tools/list', {
      _meta: {
        'io.modelcontextprotocol/protocolVersion': '2026-07-28',
        'io.modelcontextprotocol/clientCapabilities': {},
      },
    })

    await server.handle(request, transport)

    assert.equal(transport.getLastMessage()?.result?.ttlMs, 60_000)
    assert.equal(transport.getLastMessage()?.result?.cacheScope, 'public')
  })

  test('should reject an unsupported modern protocol version', async ({ assert }) => {
    const server = new Server({})
    const transport = new FakeTransport()
    const request = createJsonRpcRequest('tools/list', {
      _meta: {
        'io.modelcontextprotocol/protocolVersion': '2027-01-01',
        'io.modelcontextprotocol/clientCapabilities': {},
      },
    })

    await server.handle(request, transport)

    assert.equal(transport.getLastMessage()?.error?.code, ErrorCode.UnsupportedProtocolVersion)
    assert.equal(transport.getLastOptions()?.status, 400)
  })

  test('should keep server discovery unavailable to legacy requests', async ({ assert }) => {
    const server = new Server({})
    const transport = new FakeTransport()

    await server.handle(createJsonRpcRequest('server/discover', {}), transport)

    assert.equal(transport.getLastMessage()?.error?.code, ErrorCode.MethodNotFound)
  })

  test('should create context from request', ({ assert }) => {
    const server = new Server({})
    const request = createJsonRpcRequest('test')

    const context = server.createContext(request)

    assert.equal(context.serverName, server.name)
    assert.equal(context.serverVersion, server.version)
    assert.equal(context.request.id, request.id)
  })

  test('should not cross-wire responses when two requests overlap', async ({ assert }) => {
    const server = new Server({})
    const transportA = new FakeTransport()
    const transportB = new FakeTransport()

    // Each request passes its own transport directly to handle(), the
    // way an HTTP controller does -- not via connect(), which is only
    // safe for stdio's one-transport-for-the-whole-process case. B
    // starts while A's handle() is still in flight.
    const requestA = createInitializeRequest('2025-06-18', 'request-a')
    const handleA = server.handle(requestA, transportA)

    const requestB = createInitializeRequest('2025-06-18', 'request-b')
    await server.handle(requestB, transportB)

    await handleA

    assert.equal(
      transportA.getLastMessage()?.id,
      'request-a',
      "request A's response should go out on transport A"
    )
    assert.equal(
      transportB.getLastMessage()?.id,
      'request-b',
      "request B's response should go out on transport B"
    )
  })

  test('should keep the transport connected when a request started', async ({ assert }) => {
    const server = new Server({})
    const transportA = new FakeTransport()
    const transportB = new FakeTransport()

    // handle() must capture the transport when it starts, not re-read the
    // shared field at send() time: a later connect() should never redirect
    // an already in-flight request's response.
    await server.connect(transportA)
    const requestA = createInitializeRequest('2025-06-18', 'request-a')
    const handleA = server.handle(requestA)

    await server.connect(transportB)
    const requestB = createInitializeRequest('2025-06-18', 'request-b')
    await server.handle(requestB)

    await handleA

    assert.equal(
      transportA.getLastMessage()?.id,
      'request-a',
      "request A's response should go out on the transport connected when A started"
    )
    assert.equal(
      transportB.getLastMessage()?.id,
      'request-b',
      "request B's response should go out on transport B"
    )
  })
})

test('rejects malformed envelopes without throwing', async ({ assert }) => {
  for (const input of [
    null,
    {},
    [],
    { jsonrpc: '2.0', method: 1 },
    { jsonrpc: '1.0', method: 'ping', id: 1 },
    { jsonrpc: '2.0', method: 'ping', id: {}, params: {} },
    { jsonrpc: '2.0', method: 'ping', id: 1, params: null },
  ]) {
    const transport = new FakeTransport()
    await new Server({}).handle(input as any, transport)
    assert.equal(transport.getLastMessage()?.error?.code, ErrorCode.InvalidRequest)
    assert.isNull(transport.getLastMessage()?.id)
  }
})

test('ignores notifications and still responds to id zero', async ({ assert }) => {
  const server = new Server({})
  const transport = new FakeTransport()
  await server.handle({ jsonrpc: '2.0', method: 'notifications/initialized' } as any, transport)
  assert.notExists(transport.getLastMessage())
  await server.handle({ jsonrpc: '2.0', method: 'ping', id: 0 }, transport)
  assert.equal(transport.getLastMessage()?.id, 0)
})
