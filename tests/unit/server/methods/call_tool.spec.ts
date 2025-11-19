/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import CallTool from '../../../../src/server/methods/call_tool.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createToolsCallRequest, createJsonRpcRequest } from '../../../helpers/create_request.js'
import { ErrorCode } from '../../../../src/enums/error.js'

test.group('CallTool Method', () => {
  test('should throw error when tool name is missing', async ({ assert }) => {
    const request = createJsonRpcRequest('tools/call', {})
    const context = createTestContext(request)
    const method = new CallTool()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.InvalidParams)
      assert.equal(error.requestId, request.id)
    }
  })

  test('should throw error when tool is not found', async ({ assert }) => {
    const request = createToolsCallRequest('non-existent-tool')
    const context = createTestContext(request, {
      tools: {},
    })
    const method = new CallTool()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.MethodNotFound)
      assert.equal(error.requestId, request.id)
    }
  })

  test('should throw error for invalid request method', async ({ assert }) => {
    const request = createJsonRpcRequest('invalid-method')
    const context = createTestContext(request)
    const method = new CallTool()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.MethodNotFound)
    }
  })
})

