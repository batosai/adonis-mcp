/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import ReadResource from '../../../../src/server/methods/read_resource.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createResourcesReadRequest, createJsonRpcRequest } from '../../../helpers/create_request.js'
import { ErrorCode } from '../../../../src/enums/error.js'

// Import resource fixtures using relative paths
const resource1Module = '../../../fixtures/resources/test_resource_1.ts'
const resource2Module = '../../../fixtures/resources/test_resource_2.ts'

test.group('ReadResource Method', () => {
  test('should throw error when resource URI is missing', async ({ assert }) => {
    const request = createJsonRpcRequest('resources/read', {})
    const context = createTestContext(request)
    const method = new ReadResource()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.InvalidParams)
      assert.equal(error.requestId, request.id)
    }
  })

  test('should throw error when resource is not found', async ({ assert }) => {
    const request = createResourcesReadRequest('file:///non-existent-resource.txt')
    const context = createTestContext(request, {
      resources: {},
    })
    const method = new ReadResource()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.MethodNotFound)
      assert.equal(error.requestId, request.id)
    }
  })

  test('should return text resource content', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        [uri]: resource1Path,
      },
    })
    const method = new ReadResource()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.contents)
    assert.isArray(response.result?.contents)
    assert.lengthOf(response.result?.contents, 1)
    
    const content = response.result?.contents[0]
    assert.exists(content)
    assert.equal(content?.text, 'Hello from test resource 1')
    assert.equal(content?.uri, uri)
    assert.equal(content?.mimeType, 'text/plain')
    assert.equal(content?.size, 100)
  })

  test('should return blob resource content', async ({ assert }) => {
    const uri = 'file:///test-resource-2.bin'
    const resource2Path = new URL(resource2Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        [uri]: resource2Path,
      },
    })
    const method = new ReadResource()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.contents)
    assert.isArray(response.result?.contents)
    assert.lengthOf(response.result?.contents, 1)
    
    const content = response.result?.contents[0]
    assert.exists(content)
    // Blob class encodes to base64, so "Hello World" becomes "SGVsbG8gV29ybGQ="
    assert.equal(content?.blob, 'SGVsbG8gV29ybGQ=')
    assert.equal(content?.uri, uri)
    assert.equal(content?.mimeType, 'application/octet-stream')
    assert.equal(content?.size, 200)
  })

  test('should use contents (plural) key for resources', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        [uri]: resource1Path,
      },
    })
    const method = new ReadResource()

    const response = await method.handle(context)

    assert.exists(response.result)
    assert.exists(response.result?.contents)
    assert.notExists(response.result?.content) // Should not have 'content' (singular)
  })
})

