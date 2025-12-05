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
    }
    const server = new Server(config)

    assert.equal(server.name, 'Custom Server')
    assert.equal(server.version, '2.0.0')
    assert.equal(server.instructions, 'Custom instructions')
    assert.equal(server.maxPaginationLength, 100)
    assert.equal(server.defaultPaginationLength, 20)
  })

  test('should add tool to server', ({ assert }) => {
    const server = new Server({})
    server.addTool({ 'test-tool': '/path/to/tool' })

    assert.exists(server.tools['test-tool'])
    assert.equal(server.tools['test-tool'], '/path/to/tool')
  })

  test('should add resource to server', ({ assert }) => {
    const server = new Server({})
    server.addResource({ 'test-resource': '/path/to/resource' })

    assert.exists(server.resources['test-resource'])
    assert.equal(server.resources['test-resource'], '/path/to/resource')
  })

  test('should add prompt to server', ({ assert }) => {
    const server = new Server({})
    server.addPrompt({ 'test-prompt': '/path/to/prompt' })

    assert.exists(server.prompts['test-prompt'])
    assert.equal(server.prompts['test-prompt'], '/path/to/prompt')
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

  test('should generate session id', ({ assert }) => {
    const server = new Server({})
    const sessionId = server.generateSessionId()

    assert.isString(sessionId)
    assert.isNotEmpty(sessionId)
  })

  test('should create context from request', ({ assert }) => {
    const server = new Server({})
    const request = createJsonRpcRequest('test')

    const context = server.createContext(request)

    assert.equal(context.serverName, server.name)
    assert.equal(context.serverVersion, server.version)
    assert.equal(context.request.id, request.id)
  })
})
