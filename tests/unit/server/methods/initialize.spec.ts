/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import Initialize from '../../../../src/server/methods/initialize.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createInitializeRequest, createJsonRpcRequest } from '../../../helpers/create_request.js'
import { ErrorCode } from '../../../../src/enums/error.js'

test.group('Initialize Method', () => {
  test('should handle initialize request successfully', async ({ assert }) => {
    const request = createInitializeRequest('2025-06-18')
    const context = createTestContext(request)
    const method = new Initialize()

    const response = await method.handle(context)

    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.equal(response.result?.protocolVersion, '2025-06-18')
    assert.exists(response.result?.capabilities)
    assert.exists(response.result?.serverInfo)
    const serverInfo = response.result?.serverInfo as { name: string; version: string } | undefined
    if (serverInfo) {
      assert.equal(serverInfo.name, 'Test MCP Server')
      assert.equal(serverInfo.version, '1.0.0')
    }
    assert.equal(response.result?.instructions, 'Test instructions')
  })

  test('should use first supported version when protocol version not provided', async ({
    assert,
  }) => {
    const request = createJsonRpcRequest('initialize', {
      capabilities: {
        tools: true,
        prompts: true,
        resources: true,
        logging: false,
        elicitation: {},
        roots: null,
      },
      clientInfo: {
        name: 'Test Client',
        version: '1.0.0',
      },
    })
    const context = createTestContext(request, {
      supportedProtocolVersions: ['2025-06-18', '2024-11-05'],
    })
    const method = new Initialize()

    const response = await method.handle(context)

    assert.equal(response.result?.protocolVersion, '2025-06-18')
  })

  test('should throw error for unsupported protocol version', async ({ assert }) => {
    const request = createInitializeRequest('2020-01-01')
    const context = createTestContext(request)
    const method = new Initialize()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.InvalidParams)
      assert.equal(error.requestId, request.id)
    }
  })

  test('should throw error for invalid request method', async ({ assert }) => {
    const request = createJsonRpcRequest('invalid-method')
    const context = createTestContext(request)
    const method = new Initialize()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.InvalidRequest)
    }
  })
})
