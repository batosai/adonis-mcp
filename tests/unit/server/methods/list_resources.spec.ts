/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import ListResources from '../../../../src/server/methods/list_resources.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createListResourcesRequest } from '../../../helpers/create_request.js'

// Import resource fixtures using relative paths
const resource1Module = '../../../fixtures/resources/test_resource_1.ts'
const resource2Module = '../../../fixtures/resources/test_resource_2.ts'

// JSON payloads matching Resource.toJson() output for each fixture
const resource1Json: Record<string, unknown> = {
  name: 'test-resource-1',
  title: 'Test Resource 1',
  description: 'First test resource',
  uri: 'file:///test-resource-1.txt',
  mimeType: 'text/plain',
  size: 100,
}
const resource2Json: Record<string, unknown> = {
  name: 'test-resource-2',
  title: 'Test Resource 2',
  description: 'Second test resource with blob',
  uri: 'file:///test-resource-2.bin',
  mimeType: 'application/octet-stream',
  size: 200,
}

test.group('ListResources Method', () => {
  test('should list resources successfully', async ({ assert }) => {
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const resource2Path = new URL(resource2Module, import.meta.url).href

    const request = createListResourcesRequest()
    const context = createTestContext(request, {
      resources: {
        'file:///test-resource-1.txt': { path: resource1Path, json: resource1Json },
        'file:///test-resource-2.bin': { path: resource2Path, json: resource2Json },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListResources()

    const response = await method.handle(context)

    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.resources)
    assert.isArray(response.result?.resources)
    assert.equal((response.result?.resources as any[]).length, 2)

    const resources = response.result?.resources as any[]
    const resource1 = resources.find((r) => r.uri === 'file:///test-resource-1.txt')
    const resource2 = resources.find((r) => r.uri === 'file:///test-resource-2.bin')

    assert.exists(resource1)
    assert.equal(resource1.name, 'test-resource-1')
    assert.equal(resource1.title, 'Test Resource 1')
    assert.equal(resource1.description, 'First test resource')
    assert.equal(resource1.mimeType, 'text/plain')
    assert.equal(resource1.size, 100)

    assert.exists(resource2)
    assert.equal(resource2.name, 'test-resource-2')
    assert.equal(resource2.title, 'Test Resource 2')
    assert.equal(resource2.description, 'Second test resource with blob')
    assert.equal(resource2.mimeType, 'application/octet-stream')
    assert.equal(resource2.size, 200)
  })

  test('should return empty array when no resources are registered', async ({ assert }) => {
    const request = createListResourcesRequest()
    const context = createTestContext(request, {
      resources: {},
      defaultPaginationLength: 10,
    })
    const method = new ListResources()

    const response = await method.handle(context)

    assert.exists(response.result?.resources)
    assert.isArray(response.result?.resources)
    assert.equal((response.result?.resources as any[]).length, 0)
    assert.notExists(response.result?.nextCursor)
  })

  test('should paginate resources correctly', async ({ assert }) => {
    // Use the same resource multiple times to simulate pagination
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const resource2Path = new URL(resource2Module, import.meta.url).href

    const resources: Record<string, { path: string; json: Record<string, unknown> }> = {}
    // Create 20 resource entries using the two available resources
    for (let i = 0; i < 20; i++) {
      resources[`file:///test-resource-${i}.txt`] = {
        path: i % 2 === 0 ? resource1Path : resource2Path,
        json: { uri: `file:///test-resource-${i}.txt`, name: `test-resource-${i}` },
      }
    }

    const request = createListResourcesRequest()
    const context = createTestContext(request, {
      resources,
      defaultPaginationLength: 5,
      maxPaginationLength: 10,
    })
    const method = new ListResources()

    const response = await method.handle(context)

    assert.exists(response.result?.resources)
    const resourcesList = response.result?.resources as any[]
    assert.equal(resourcesList.length, 5)
    assert.exists(response.result?.nextCursor)

    // Test second page
    const secondRequest = createListResourcesRequest(response.result?.nextCursor as string)
    const secondContext = createTestContext(secondRequest, {
      resources,
      defaultPaginationLength: 5,
      maxPaginationLength: 10,
    })

    const secondResponse = await method.handle(secondContext)
    assert.exists(secondResponse.result?.resources)
    assert.equal((secondResponse.result?.resources as any[]).length, 5)
    assert.exists(secondResponse.result?.nextCursor)
  })

  test('should not include nextCursor when all resources are returned', async ({ assert }) => {
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const resource2Path = new URL(resource2Module, import.meta.url).href

    const request = createListResourcesRequest()
    const context = createTestContext(request, {
      resources: {
        'file:///test-resource-1.txt': { path: resource1Path, json: resource1Json },
        'file:///test-resource-2.bin': { path: resource2Path, json: resource2Json },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListResources()

    const response = await method.handle(context)

    assert.exists(response.result?.resources)
    assert.equal((response.result?.resources as any[]).length, 2)
    assert.notExists(response.result?.nextCursor)
  })

  // test('should throw error when resource import fails', async ({ assert }) => {
  //   const resourcePath = pathToFileURL(join(fixturesDir, 'nonexistent-resource.ts')).href

  //   const request = createListResourcesRequest()
  //   const context = createTestContext(request, {
  //     resources: {
  //       'file:///nonexistent-resource.txt': resourcePath,
  //     },
  //     defaultPaginationLength: 10,
  //   })
  //   const method = new ListResources()

  //   try {
  //     await method.handle(context)
  //     assert.fail('Should have thrown an error')
  //   } catch (error: any) {
  //     assert.equal(error.code, ErrorCode.InternalError)
  //     assert.equal(error.requestId, request.id)
  //     assert.exists(error.data)
  //   }
  // })

  test('should respect max pagination length', async ({ assert }) => {
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const resource2Path = new URL(resource2Module, import.meta.url).href

    const resources: Record<string, { path: string; json: Record<string, unknown> }> = {}
    // Create 30 resource entries
    for (let i = 0; i < 30; i++) {
      resources[`file:///test-resource-${i}.txt`] = {
        path: i % 2 === 0 ? resource1Path : resource2Path,
        json: {},
      }
    }

    const request = createListResourcesRequest()
    const context = createTestContext(request, {
      resources,
      defaultPaginationLength: 20, // Request more than max
      maxPaginationLength: 10, // But max is 10
    })
    const method = new ListResources()

    const response = await method.handle(context)

    assert.exists(response.result?.resources)
    const resourcesList = response.result?.resources as any[]
    assert.equal(resourcesList.length, 10) // Should be limited to max
    assert.exists(response.result?.nextCursor)
  })
})
