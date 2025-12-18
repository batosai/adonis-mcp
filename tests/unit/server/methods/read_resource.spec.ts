/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ResourceContext } from '../../../../src/types/context.js'

import { test } from '@japa/runner'
import ReadResource from '../../../../src/server/methods/read_resource.js'
import { createTestContext } from '../../../helpers/create_context.js'
import {
  createResourcesReadRequest,
  createJsonRpcRequest,
} from '../../../helpers/create_request.js'
import { ErrorCode } from '../../../../src/enums/error.js'

// Import resource fixtures using relative paths
const resource1Module = '../../../fixtures/resources/test_resource_1.ts'
const resource2Module = '../../../fixtures/resources/test_resource_2.ts'
const template1Module = '../../../fixtures/resources/test_resource_template_1.ts'
const template2Module = '../../../fixtures/resources/test_resource_template_2.ts'
const template3Module = '../../../fixtures/resources/test_resource_template_3.ts'

test.group('ReadResource Method', () => {
  test('should throw error when resource URI is missing', async ({ assert }) => {
    const request = createJsonRpcRequest('resources/read', {})
    const context = createTestContext(request) as ResourceContext
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
    }) as ResourceContext
    const method = new ReadResource()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.InvalidParams)
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
    }) as ResourceContext
    const method = new ReadResource()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.contents)
    assert.isArray(response.result?.contents)
    const contents = response.result?.contents as any[]
    assert.lengthOf(contents, 1)

    const content = contents[0]
    assert.exists(content)
    assert.equal(content?.text, 'Hello from test resource 1')
    assert.equal(content?.uri, uri)
    assert.equal(content?.mimeType, 'text/plain')
  })

  test('should return blob resource content', async ({ assert }) => {
    const uri = 'file:///test-resource-2.bin'
    const resource2Path = new URL(resource2Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        [uri]: resource2Path,
      },
    }) as ResourceContext
    const method = new ReadResource()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.contents)
    assert.isArray(response.result?.contents)
    const contents = response.result?.contents as any[]
    assert.lengthOf(contents, 1)

    const content = contents[0]
    assert.exists(content)
    // Blob class encodes to base64, so "Hello World" becomes "SGVsbG8gV29ybGQ="
    assert.equal(content?.blob, 'SGVsbG8gV29ybGQ=')
    assert.equal(content?.uri, uri)
    assert.equal(content?.mimeType, 'application/octet-stream')
  })

  test('should use contents (plural) key for resources', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        [uri]: resource1Path,
      },
    }) as ResourceContext
    const method = new ReadResource()

    const response = await method.handle(context)

    assert.exists(response.result)
    assert.exists(response.result?.contents)
    assert.notExists(response.result?.content) // Should not have 'content' (singular)
  })
})

test.group('ReadResource Method - Templates', () => {
  test('should read resource via simple variable template', async ({ assert }) => {
    const uri = 'file:///users/123'
    const template1Path = new URL(template1Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        'file:///users/{id}': template1Path,
      },
    }) as ResourceContext
    const method = new ReadResource()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.contents)
    assert.isArray(response.result?.contents)
    const contents = response.result?.contents as any[]
    assert.lengthOf(contents, 1)

    const content = contents[0]
    assert.exists(content)
    assert.equal(content?.text, 'User ID: 123')
    assert.equal(content?.uri, uri)
    assert.equal(content?.mimeType, 'text/plain')
  })

  test('should read resource via template with multiple path variables', async ({ assert }) => {
    const uri = 'file:///users/123/posts/456'
    const template3Path = new URL(template3Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        'file:///users/{userId}/posts/{postId}': template3Path,
      },
    }) as ResourceContext
    const method = new ReadResource()

    const response = await method.handle(context)

    assert.exists(response)
    assert.exists(response.result?.contents)
    const contents = response.result?.contents as any[]
    const content = contents[0]

    assert.equal(content?.text, 'User: 123, Post: 456')
    assert.equal(content?.uri, uri)
    assert.equal(content?.mimeType, 'text/plain')
  })

  test('should read resource via template with query parameters', async ({ assert }) => {
    const uri = 'file:///api?page=1&limit=10'
    const template2Path = new URL(template2Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        'file:///api{?page,limit}': template2Path,
      },
    }) as ResourceContext
    const method = new ReadResource()

    const response = await method.handle(context)

    assert.exists(response)
    assert.exists(response.result?.contents)
    const contents = response.result?.contents as any[]
    const content = contents[0]

    assert.equal(content?.text, 'Page: 1, Limit: 10')
    assert.equal(content?.uri, uri)
    assert.equal(content?.mimeType, 'application/json')
  })

  test('should extract and pass variables to resource handler', async ({ assert }) => {
    const uri = 'file:///users/999'
    const template1Path = new URL(template1Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        'file:///users/{id}': template1Path,
      },
    }) as ResourceContext
    const method = new ReadResource()

    const response = await method.handle(context)
    const contents = response.result?.contents as any[]
    const content = contents[0]

    // Verify the handler received and used the correct ID
    assert.equal(content?.text, 'User ID: 999')
  })

  test('should throw error when template URI does not match', async ({ assert }) => {
    const uri = 'file:///posts/123' // Does not match users template
    const template1Path = new URL(template1Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        'file:///users/{id}': template1Path,
      },
    }) as ResourceContext
    const method = new ReadResource()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.InvalidParams)
      assert.include(error.message, uri)
    }
  })

  test('should prefer exact URI match over template match', async ({ assert }) => {
    const uri = 'file:///users/123'
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const template1Path = new URL(template1Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        'file:///users/123': resource1Path, // Exact match
        'file:///users/{id}': template1Path, // Template match
      },
    }) as ResourceContext
    const method = new ReadResource()

    const response = await method.handle(context)
    const contents = response.result?.contents as any[]
    const content = contents[0]

    // Should use exact match, not template
    // The exact resource returns "Hello from test resource 1"
    // The template would return "User ID: 123"
    assert.equal(content?.text, 'Hello from test resource 1')
  })

  test('should handle different template patterns for different resources', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template3Path = new URL(template3Module, import.meta.url).href

    const resources = {
      'file:///users/{id}': template1Path,
      'file:///users/{userId}/posts/{postId}': template3Path,
    }

    // Test first pattern
    const uri1 = 'file:///users/123'
    const request1 = createResourcesReadRequest(uri1)
    const context1 = createTestContext(request1, { resources }) as ResourceContext
    const method1 = new ReadResource()
    const response1 = await method1.handle(context1)
    const content1 = (response1.result?.contents as any[])[0]
    assert.equal(content1?.text, 'User ID: 123')

    // Test second pattern
    const uri2 = 'file:///users/123/posts/456'
    const request2 = createResourcesReadRequest(uri2)
    const context2 = createTestContext(request2, { resources }) as ResourceContext
    const method2 = new ReadResource()
    const response2 = await method2.handle(context2)
    const content2 = (response2.result?.contents as any[])[0]
    assert.equal(content2?.text, 'User: 123, Post: 456')
  })

  test('should handle template with special characters in variables', async ({ assert }) => {
    const uri = 'file:///users/abc-123-xyz'
    const template1Path = new URL(template1Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        'file:///users/{id}': template1Path,
      },
    }) as ResourceContext
    const method = new ReadResource()

    const response = await method.handle(context)
    const contents = response.result?.contents as any[]
    const content = contents[0]

    assert.equal(content?.text, 'User ID: abc-123-xyz')
  })

  test('should handle template with numeric IDs', async ({ assert }) => {
    const uri = 'file:///users/42'
    const template1Path = new URL(template1Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        'file:///users/{id}': template1Path,
      },
    }) as ResourceContext
    const method = new ReadResource()

    const response = await method.handle(context)
    const contents = response.result?.contents as any[]
    const content = contents[0]

    assert.equal(content?.text, 'User ID: 42')
  })

  test('should handle query parameters with various values', async ({ assert }) => {
    const uri = 'file:///api?page=5&limit=100'
    const template2Path = new URL(template2Module, import.meta.url).href
    const request = createResourcesReadRequest(uri)
    const context = createTestContext(request, {
      resources: {
        'file:///api{?page,limit}': template2Path,
      },
    }) as ResourceContext
    const method = new ReadResource()

    const response = await method.handle(context)
    const contents = response.result?.contents as any[]
    const content = contents[0]

    assert.equal(content?.text, 'Page: 5, Limit: 100')
  })
})
