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

// Import tool fixtures using relative paths
const toolWithTextModule = '../../../fixtures/tools/test_tool_with_text.ts'
const toolWithErrorModule = '../../../fixtures/tools/test_tool_with_error.ts'
const toolWithMultipleContentsModule = '../../../fixtures/tools/test_tool_with_multiple_contents.ts'

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

  test('should call tool successfully and return text content', async ({ assert }) => {
    const name = 'test-tool-with-text'
    const toolPath = new URL(toolWithTextModule, import.meta.url).href
    const request = createToolsCallRequest(name, { message: 'Hello World' })
    const context = createTestContext(request, {
      tools: {
        [name]: toolPath,
      },
    })
    const method = new CallTool()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.content)
    assert.isArray(response.result?.content)
    const contents = response.result?.content as any[]
    assert.equal(contents.length, 1)
    assert.notExists(response.result?.isError)

    const content = contents[0]
    assert.exists(content)
    assert.equal(content?.type, 'text')
    assert.equal(content?.text, 'Response: Hello World')
  })

  test('should call tool successfully and return error content', async ({ assert }) => {
    const name = 'test-tool-with-error'
    const toolPath = new URL(toolWithErrorModule, import.meta.url).href
    const request = createToolsCallRequest(name)
    const context = createTestContext(request, {
      tools: {
        [name]: toolPath,
      },
    })
    const method = new CallTool()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.content)
    assert.isArray(response.result?.content)
    const contents = response.result?.content as any[]
    assert.equal(contents.length, 1)
    assert.equal(response.result?.isError, true)

    const content = contents[0]
    assert.exists(content)
    assert.equal(content?.type, 'text')
    assert.equal(content?.text, 'An error occurred')
  })

  test('should call tool successfully and return multiple contents', async ({ assert }) => {
    const name = 'test-tool-with-multiple-contents'
    const toolPath = new URL(toolWithMultipleContentsModule, import.meta.url).href
    const request = createToolsCallRequest(name)
    const context = createTestContext(request, {
      tools: {
        [name]: toolPath,
      },
    })
    const method = new CallTool()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.content)
    assert.isArray(response.result?.content)
    const contents = response.result?.content as any[]
    assert.equal(contents.length, 2)
    assert.notExists(response.result?.isError)
    assert.equal(contents[0].type, 'text')
    assert.equal(contents[0].text, 'First message')
    assert.equal(contents[1].type, 'text')
    assert.equal(contents[1].text, 'Second message')
  })

  test('should throw error when tool import fails', async ({ assert }) => {
    const name = 'test-tool-import-fails'
    const toolPath = 'file:///nonexistent/path/to/tool.ts'
    const request = createToolsCallRequest(name)
    const context = createTestContext(request, {
      tools: {
        [name]: toolPath,
      },
    })
    const method = new CallTool()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.InternalError)
      assert.equal(error.requestId, request.id)
    }
  })
})
