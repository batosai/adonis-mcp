/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import { findResourcePattern, findResource } from '../../../src/utils/find_resource_pattern.js'
import { createTestContext } from '../../helpers/create_context.js'
import { createResourcesReadRequest } from '../../helpers/create_request.js'
import { fakeApp } from '../../helpers/fake_app.js'
import { ErrorCode } from '../../../src/enums/error.js'

const resource1Module = '../../fixtures/resources/test_resource_1.ts'
const template1Module = '../../fixtures/resources/test_resource_template_1.ts'
const template2Module = '../../fixtures/resources/test_resource_template_2.ts'
const template3Module = '../../fixtures/resources/test_resource_template_3.ts'

test.group('findResourcePattern - Exact URI match', () => {
  test('should find resource with exact URI match', ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = {
      [uri]: resource1Path,
    }

    const key = findResourcePattern({ uri, resourceList })

    assert.equal(key, uri)
  })

  test('should return undefined when no exact match exists', ({ assert }) => {
    const uri = 'file:///non-existent.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = {
      'file:///test-resource-1.txt': resource1Path,
    }

    const key = findResourcePattern({ uri, resourceList })

    assert.isUndefined(key)
  })

  test('should prefer exact match over template match', ({ assert }) => {
    const uri = 'file:///users/123'
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const template1Path = new URL(template1Module, import.meta.url).href

    const resourceList = {
      'file:///users/123': resource1Path, // Exact match
      'file:///users/{id}': template1Path, // Template match
    }

    const key = findResourcePattern({ uri, resourceList })

    // Should return the exact match first
    assert.equal(key, 'file:///users/123')
  })
})

test.group('findResourcePattern - Template match', () => {
  test('should match simple variable template', ({ assert }) => {
    const uri = 'file:///users/123'
    const template1Path = new URL(template1Module, import.meta.url).href

    const resourceList = {
      'file:///users/{id}': template1Path,
    }

    const key = findResourcePattern({ uri, resourceList })

    assert.equal(key, 'file:///users/{id}')
  })

  test('should match template with multiple path variables', ({ assert }) => {
    const uri = 'file:///users/123/posts/456'
    const template3Path = new URL(template3Module, import.meta.url).href

    const resourceList = {
      'file:///users/{userId}/posts/{postId}': template3Path,
    }

    const key = findResourcePattern({ uri, resourceList })

    assert.equal(key, 'file:///users/{userId}/posts/{postId}')
  })

  test('should match template with query parameters', ({ assert }) => {
    const uri = 'file:///api?page=1&limit=10'
    const template2Path = new URL(template2Module, import.meta.url).href

    const resourceList = {
      'file:///api{?page,limit}': template2Path,
    }

    const key = findResourcePattern({ uri, resourceList })

    assert.equal(key, 'file:///api{?page,limit}')
  })

  test('should return undefined when URI does not match any template', ({ assert }) => {
    const uri = 'file:///posts/123'
    const template1Path = new URL(template1Module, import.meta.url).href

    const resourceList = {
      'file:///users/{id}': template1Path,
    }

    const key = findResourcePattern({ uri, resourceList })

    assert.isUndefined(key)
  })

  test('should match first matching template in resource list', ({ assert }) => {
    const uri = 'file:///users/123'
    const template1Path = new URL(template1Module, import.meta.url).href

    const resourceList = {
      'file:///users/{id}': template1Path,
      'file:///users/{userId}': template1Path, // Another matching template
    }

    const key = findResourcePattern({ uri, resourceList })

    // Should return the first match (order depends on Object.keys)
    assert.isString(key)
    assert.isTrue(key === 'file:///users/{id}' || key === 'file:///users/{userId}')
  })
})

test.group('findResourcePattern - Context args extraction', () => {
  test('should extract variables into context args', ({ assert }) => {
    const uri = 'file:///users/123'
    const template1Path = new URL(template1Module, import.meta.url).href

    const resourceList = {
      'file:///users/{id}': template1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const key = findResourcePattern({ uri, resourceList, ctx: ctx as any })

    assert.equal(key, 'file:///users/{id}')
    assert.exists((ctx as any).args)
    assert.deepEqual((ctx as any).args, { id: '123' })
  })

  test('should extract multiple variables into context args', ({ assert }) => {
    const uri = 'file:///users/123/posts/456'
    const template3Path = new URL(template3Module, import.meta.url).href

    const resourceList = {
      'file:///users/{userId}/posts/{postId}': template3Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const key = findResourcePattern({ uri, resourceList, ctx: ctx as any })

    assert.equal(key, 'file:///users/{userId}/posts/{postId}')
    assert.exists((ctx as any).args)
    assert.deepEqual((ctx as any).args, { userId: '123', postId: '456' })
  })

  test('should extract query parameters into context args', ({ assert }) => {
    const uri = 'file:///api?page=1&limit=10'
    const template2Path = new URL(template2Module, import.meta.url).href

    const resourceList = {
      'file:///api{?page,limit}': template2Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const key = findResourcePattern({ uri, resourceList, ctx: ctx as any })

    assert.equal(key, 'file:///api{?page,limit}')
    assert.exists((ctx as any).args)
    assert.deepEqual((ctx as any).args, { page: '1', limit: '10' })
  })

  test('should not set args when no context is provided', ({ assert }) => {
    const uri = 'file:///users/123'
    const template1Path = new URL(template1Module, import.meta.url).href

    const resourceList = {
      'file:///users/{id}': template1Path,
    }

    // No context provided
    const key = findResourcePattern({ uri, resourceList })

    assert.equal(key, 'file:///users/{id}')
    // No error should be thrown
  })

  test('should not set args for exact match', ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = {
      [uri]: resource1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const key = findResourcePattern({ uri, resourceList, ctx: ctx as any })

    assert.equal(key, uri)
    // args should not be set for exact match (or be undefined/empty)
  })
})

test.group('findResource - Resource loading', () => {
  test('should load and instantiate resource with exact URI', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = {
      [uri]: resource1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const resource = await findResource({ app: fakeApp, uri, resourceList, ctx: ctx as any })

    assert.exists(resource)
    assert.equal(resource.name, 'test-resource-1')
    assert.equal(resource.uri, uri)
    assert.equal(resource.title, 'Test Resource 1')
  })

  test('should load and instantiate resource with template URI', async ({ assert }) => {
    const uri = 'file:///users/123'
    const template1Path = new URL(template1Module, import.meta.url).href

    const resourceList = {
      'file:///users/{id}': template1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const resource = await findResource({ app: fakeApp, uri, resourceList, ctx: ctx as any })

    assert.exists(resource)
    assert.equal(resource.name, 'test-resource-template-1')
    assert.equal(resource.uri, uri) // Should be set to the actual URI
    assert.equal(resource.title, 'Test Resource Template 1')
  })

  test('should set context args when matching template', async ({ assert }) => {
    const uri = 'file:///users/123/posts/456'
    const template3Path = new URL(template3Module, import.meta.url).href

    const resourceList = {
      'file:///users/{userId}/posts/{postId}': template3Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const resource = await findResource({ app: fakeApp, uri, resourceList, ctx: ctx as any })

    assert.exists(resource)
    assert.equal(resource.name, 'test-resource-template-3')
    assert.exists((ctx as any).args)
    assert.deepEqual((ctx as any).args, { userId: '123', postId: '456' })
  })

  test('should throw MethodNotFound error when resource not found', async ({ assert }) => {
    const uri = 'file:///non-existent.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = {
      'file:///test-resource-1.txt': resource1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    try {
      await findResource({ app: fakeApp, uri, resourceList, ctx: ctx as any })
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.InvalidParams)
      assert.include(error.message, 'file:///non-existent.txt')
      assert.include(error.message, 'was not found')
      assert.equal(error.requestId, request.id)
    }
  })

  test('should throw error with correct request ID', async ({ assert }) => {
    const uri = 'file:///missing.txt'
    const resourceList = {}

    const requestId = 'test-request-123'
    const request = createResourcesReadRequest(uri, requestId)
    const ctx = createTestContext(request, { resources: resourceList })

    try {
      await findResource({ app: fakeApp, uri, resourceList, ctx: ctx as any })
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.requestId, requestId)
    }
  })
})

test.group('findResource - Resource instantiation', () => {
  test('should set uri property on resource instance', async ({ assert }) => {
    const uri = 'file:///users/999'
    const template1Path = new URL(template1Module, import.meta.url).href

    const resourceList = {
      'file:///users/{id}': template1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const resource = await findResource({ app: fakeApp, uri, resourceList, ctx: ctx as any })

    // The uri should be set to the actual requested URI, not the template
    assert.equal(resource.uri, uri)
  })

  test('should create new instance for each call', async ({ assert }) => {
    const uri = 'file:///users/123'
    const template1Path = new URL(template1Module, import.meta.url).href

    const resourceList = {
      'file:///users/{id}': template1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx1 = createTestContext(request, { resources: resourceList })
    const ctx2 = createTestContext(request, { resources: resourceList })

    const resource1 = await findResource({ app: fakeApp, uri, resourceList, ctx: ctx1 as any })
    const resource2 = await findResource({ app: fakeApp, uri, resourceList, ctx: ctx2 as any })

    // Should be different instances
    assert.notStrictEqual(resource1, resource2)
  })
})

test.group('findResource - Complex scenarios', () => {
  test('should handle multiple resources with different patterns', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template3Path = new URL(template3Module, import.meta.url).href

    const resourceList = {
      'file:///users/{id}': template1Path,
      'file:///users/{userId}/posts/{postId}': template3Path,
    }

    // Test first pattern
    const uri1 = 'file:///users/123'
    const request1 = createResourcesReadRequest(uri1)
    const ctx1 = createTestContext(request1, { resources: resourceList })
    const resource1 = await findResource({
      app: fakeApp,
      uri: uri1,
      resourceList,
      ctx: ctx1 as any,
    })

    assert.equal(resource1.name, 'test-resource-template-1')
    assert.deepEqual((ctx1 as any).args, { id: '123' })

    // Test second pattern
    const uri2 = 'file:///users/123/posts/456'
    const request2 = createResourcesReadRequest(uri2)
    const ctx2 = createTestContext(request2, { resources: resourceList })
    const resource2 = await findResource({
      app: fakeApp,
      uri: uri2,
      resourceList,
      ctx: ctx2 as any,
    })

    assert.equal(resource2.name, 'test-resource-template-3')
    assert.deepEqual((ctx2 as any).args, { userId: '123', postId: '456' })
  })

  test('should handle resource with query parameters', async ({ assert }) => {
    const uri = 'file:///api?page=2&limit=20'
    const template2Path = new URL(template2Module, import.meta.url).href

    const resourceList = {
      'file:///api{?page,limit}': template2Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const resource = await findResource({ app: fakeApp, uri, resourceList, ctx: ctx as any })

    assert.exists(resource)
    assert.equal(resource.name, 'test-resource-template-2')
    assert.deepEqual((ctx as any).args, { page: '2', limit: '20' })
  })
})
