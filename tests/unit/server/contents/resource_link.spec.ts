/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import ResourceLink from '../../../../src/server/contents/resource_link.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createResourcesReadRequest } from '../../../helpers/create_request.js'

const resource1Module = '../../../fixtures/resources/test_resource_1.ts'
const template1Module = '../../../fixtures/resources/test_resource_template_1.ts'

const mockTool = {} as any
const mockPrompt = {} as any
const mockResource = {} as any

test.group('ResourceLink Content - Unsupported operations', () => {
  test('should throw error when converting to prompt', async ({ assert }) => {
    const link = new ResourceLink('file:///test.txt')

    try {
      await link.toPrompt(mockPrompt)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'Resource link content may not be used in prompts')
      assert.equal(error.code, 'E_RESOURCE_LINK_NOT_SUPPORTED')
    }
  })

  test('should throw error when converting to resource', async ({ assert }) => {
    const link = new ResourceLink('file:///test.txt')

    try {
      await link.toResource(mockResource)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'Resource link content may not be used in resources')
      assert.equal(error.code, 'E_RESOURCE_LINK_NOT_SUPPORTED')
    }
  })
})

test.group('ResourceLink Content - preProcess and toTool', () => {
  test('should preProcess and convert to tool content without meta', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = {
      [uri]: resource1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)
    await link.preProcess(ctx as any)

    const result = await link.toTool(mockTool)

    assert.equal(result.type, 'resource_link')
    assert.equal(result.name, 'test-resource-1')
    assert.equal(result.uri, uri)
    assert.equal(result.title, 'Test Resource 1')
    assert.equal(result.description, 'First test resource')
    assert.equal(result.mimeType, 'text/plain')
    assert.equal(result.size, 100)
    assert.notProperty(result, '_meta')
  })

  test('should include _meta when withMeta is used for tool', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = {
      [uri]: resource1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)
    link.withMeta({ linkType: 'reference', importance: 'high' })
    await link.preProcess(ctx as any)

    const result = await link.toTool(mockTool)

    assert.equal(result.type, 'resource_link')
    assert.equal(result.name, 'test-resource-1')
    assert.property(result, '_meta')
    assert.deepEqual(result._meta, {
      linkType: 'reference',
      importance: 'high',
    })
  })

  test('should work with resource templates', async ({ assert }) => {
    const uri = 'file:///users/123'
    const template1Path = new URL(template1Module, import.meta.url).href

    const resourceList = {
      'file:///users/{id}': template1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)
    link.withMeta({ dynamic: true, userId: 123 })
    await link.preProcess(ctx as any)

    const result = await link.toTool(mockTool)

    assert.equal(result.type, 'resource_link')
    assert.equal(result.name, 'test-resource-template-1')
    assert.equal(result.uri, uri)
    assert.property(result, '_meta')
    assert.equal(result._meta?.dynamic, true)
    assert.equal(result._meta?.userId, 123)
  })

  test('should allow chaining withMeta', ({ assert }) => {
    const link = new ResourceLink('file:///test.txt')
    const returnValue = link.withMeta({ key: 'value' })

    assert.strictEqual(returnValue, link)
  })

  test('should override meta when withMeta is called multiple times', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)
    link.withMeta({ first: 'meta' })
    link.withMeta({ second: 'meta' })
    await link.preProcess(ctx as any)

    const result = await link.toTool(mockTool)

    assert.property(result, '_meta')
    assert.deepEqual(result._meta, { second: 'meta' })
  })

  test('should include all resource properties in link', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)
    await link.preProcess(ctx as any)

    const result = await link.toTool(mockTool)

    // Verify all properties are present
    assert.property(result, 'name')
    assert.property(result, 'uri')
    assert.property(result, 'title')
    assert.property(result, 'description')
    assert.property(result, 'mimeType')
    assert.property(result, 'size')
  })
})

test.group('ResourceLink Content - withMeta edge cases', () => {
  test('should handle empty meta object', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)
    link.withMeta({})
    await link.preProcess(ctx as any)

    const result = await link.toTool(mockTool)

    assert.deepEqual(result._meta, {})
  })

  test('should preserve meta across multiple conversions', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)
    link.withMeta({ shared: 'meta', timestamp: Date.now() })
    await link.preProcess(ctx as any)

    const result1 = await link.toTool(mockTool)
    const result2 = await link.toTool(mockTool)

    assert.property(result1, '_meta')
    assert.property(result2, '_meta')
    assert.deepEqual(result1._meta, result2._meta)
  })

  test('should work without calling withMeta', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)
    await link.preProcess(ctx as any)

    const result = await link.toTool(mockTool)

    assert.notProperty(result, '_meta')
  })

  test('should handle complex meta objects', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)
    link.withMeta({
      linkMetadata: {
        cached: false,
        fetchTime: Date.now(),
      },
      tags: ['important', 'external'],
      validation: { status: 'valid', checkedAt: '2024-01-01' },
    })
    await link.preProcess(ctx as any)

    const result = await link.toTool(mockTool)

    assert.property(result, '_meta')
    assert.property(result._meta?.linkMetadata, 'cached')
    assert.property(result._meta, 'tags')
    assert.property(result._meta, 'validation')
  })

  test('should handle meta with resource-specific information', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)
    link.withMeta({
      relationship: 'parent',
      depth: 2,
      breadcrumbs: ['root', 'folder', 'file'],
      permissions: { read: true, write: false },
    })
    await link.preProcess(ctx as any)

    const result = await link.toTool(mockTool)

    assert.property(result, '_meta')
    assert.equal(result._meta?.relationship, 'parent')
    assert.equal(result._meta?.depth, 2)
    assert.isArray(result._meta?.breadcrumbs)
  })
})

test.group('ResourceLink Content - Error handling', () => {
  test('should throw error if toTool is called before preProcess', async ({ assert }) => {
    const link = new ResourceLink('file:///test.txt')

    try {
      await link.toTool(mockTool)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'Resource not found')
      assert.equal(error.code, 'E_RESOURCE_NOT_FOUND')
    }
  })

  test('should throw error if resource is not found during preProcess', async ({ assert }) => {
    const uri = 'file:///non-existent.txt'
    const resourceList = {}

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)

    try {
      await link.preProcess(ctx as any)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'was not found')
    }
  })
})

test.group('ResourceLink Content - Integration with templates', () => {
  test('should create link to templated resource and preserve meta', async ({ assert }) => {
    const uri = 'file:///users/456'
    const template1Path = new URL(template1Module, import.meta.url).href

    const resourceList = {
      'file:///users/{id}': template1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const link = new ResourceLink(uri)
    link.withMeta({
      templateUri: 'file:///users/{id}',
      resolvedId: '456',
      matchedPattern: true,
    })
    await link.preProcess(ctx as any)

    const result = await link.toTool(mockTool)

    assert.equal(result.uri, uri)
    assert.property(result, '_meta')
    assert.equal(result._meta?.templateUri, 'file:///users/{id}')
    assert.equal(result._meta?.resolvedId, '456')
  })
})
