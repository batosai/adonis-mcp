/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import EmbeddedResource from '../../../../src/server/contents/embedded_resource.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createResourcesReadRequest } from '../../../helpers/create_request.js'

const resource1Module = '../../../fixtures/resources/test_resource_1.ts'
const template1Module = '../../../fixtures/resources/test_resource_template_1.ts'

const mockTool = {} as any
const mockPrompt = {} as any
const mockResource = {} as any

test.group('EmbeddedResource Content', () => {

  test('should default to user role', ({ assert }) => {
    const embedded = new EmbeddedResource('file:///test.txt')
    assert.equal(embedded.role, 'user')
  })

  test('should allow setting role to assistant', ({ assert }) => {
    const embedded = new EmbeddedResource('file:///test.txt')
    const result = embedded.asAssistant()
    assert.equal(embedded.role, 'assistant')
    assert.strictEqual(result, embedded)
  })

  test('should allow setting role to user', ({ assert }) => {
    const embedded = new EmbeddedResource('file:///test.txt').asAssistant()
    const result = embedded.asUser()
    assert.equal(embedded.role, 'user')
    assert.strictEqual(result, embedded)
  })
})

test.group('EmbeddedResource Content - Unsupported operations', () => {
  test('should throw error when converting to resource', async ({ assert }) => {
    const embedded = new EmbeddedResource('file:///test.txt')

    try {
      await embedded.toResource(mockResource)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'Embedded resource content may not be used in resources')
      assert.equal(error.code, 'E_EMBEDDED_RESOURCE_NOT_SUPPORTED')
    }
  })
})

test.group('EmbeddedResource Content - preProcess and toTool', () => {
  test('should preProcess and convert to tool content without meta', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = {
      [uri]: resource1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const embedded = new EmbeddedResource(uri)
    await embedded.preProcess(ctx as any)

    const result = await embedded.toTool(mockTool)

    assert.property(result, 'type')
    assert.equal(result.type, 'resource')
    assert.property(result, 'resource')
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

    const embedded = new EmbeddedResource(uri)
    embedded.withMeta({ embedType: 'inline', priority: 'high' })
    await embedded.preProcess(ctx as any)

    const result = await embedded.toTool(mockTool)

    assert.equal(result.type, 'resource')
    assert.property(result, '_meta')
    assert.deepEqual(result._meta, {
      embedType: 'inline',
      priority: 'high',
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

    const embedded = new EmbeddedResource(uri)
    embedded.withMeta({ templateMatch: true })
    await embedded.preProcess(ctx as any)

    const result = await embedded.toTool(mockTool)

    assert.equal(result.type, 'resource')
    assert.property(result, '_meta')
    assert.equal(result._meta?.templateMatch, true)
  })

  test('should allow chaining withMeta', ({ assert }) => {
    const embedded = new EmbeddedResource('file:///test.txt')
    const returnValue = embedded.withMeta({ key: 'value' })

    assert.strictEqual(returnValue, embedded)
  })

  test('should override meta when withMeta is called multiple times', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const embedded = new EmbeddedResource(uri)
    embedded.withMeta({ first: 'meta' })
    embedded.withMeta({ second: 'meta' })
    await embedded.preProcess(ctx as any)

    const result = await embedded.toTool(mockTool)

    assert.property(result, '_meta')
    assert.deepEqual(result._meta, { second: 'meta' })
  })
})

test.group('EmbeddedResource Content - preProcess and toPrompt', () => {
  test('should preProcess and convert to prompt content without meta', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = {
      [uri]: resource1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const embedded = new EmbeddedResource(uri)
    await embedded.preProcess(ctx as any)

    const result = await embedded.toPrompt(mockPrompt)

    assert.property(result, 'type')
    assert.equal(result.type, 'resource')
    assert.property(result, 'resource')
    assert.notProperty(result, '_meta')
  })

  test('should include _meta when withMeta is used for prompt', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = {
      [uri]: resource1Path,
    }

    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const embedded = new EmbeddedResource(uri)
    embedded.withMeta({ context: 'prompt-context', relevance: 0.9 })
    await embedded.preProcess(ctx as any)

    const result = await embedded.toPrompt(mockPrompt)

    assert.equal(result.type, 'resource')
    assert.property(result, '_meta')
    assert.deepEqual(result._meta, {
      context: 'prompt-context',
      relevance: 0.9,
    })
  })

  test('should work with role and meta together', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const embedded = new EmbeddedResource(uri)
    embedded.asAssistant().withMeta({ generated: true })
    await embedded.preProcess(ctx as any)

    const result = await embedded.toPrompt(mockPrompt)

    assert.equal(embedded.role, 'assistant')
    assert.property(result, '_meta')
    assert.equal(result._meta?.generated, true)
  })
})

test.group('EmbeddedResource Content - withMeta edge cases', () => {
  test('should handle empty meta object', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const embedded = new EmbeddedResource(uri)
    embedded.withMeta({})
    await embedded.preProcess(ctx as any)

    const result = await embedded.toTool(mockTool)

    assert.deepEqual(result._meta, {})
  })

  test('should preserve meta across multiple conversions', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const embedded = new EmbeddedResource(uri)
    embedded.withMeta({ shared: 'meta', id: 456 })
    await embedded.preProcess(ctx as any)

    const toolResult = await embedded.toTool(mockTool)
    const promptResult = await embedded.toPrompt(mockPrompt)

    assert.property(toolResult, '_meta')
    assert.property(promptResult, '_meta')
    assert.deepEqual(toolResult._meta, { shared: 'meta', id: 456 })
    assert.deepEqual(promptResult._meta, { shared: 'meta', id: 456 })
  })

  test('should work without calling withMeta', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const embedded = new EmbeddedResource(uri)
    await embedded.preProcess(ctx as any)

    const toolResult = await embedded.toTool(mockTool)
    const promptResult = await embedded.toPrompt(mockPrompt)

    assert.notProperty(toolResult, '_meta')
    assert.notProperty(promptResult, '_meta')
  })

  test('should handle complex meta objects', async ({ assert }) => {
    const uri = 'file:///test-resource-1.txt'
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const resourceList = { [uri]: resource1Path }
    const request = createResourcesReadRequest(uri)
    const ctx = createTestContext(request, { resources: resourceList })

    const embedded = new EmbeddedResource(uri)
    embedded.withMeta({
      resourceInfo: {
        cached: true,
        cacheKey: 'abc123',
      },
      permissions: ['read', 'execute'],
      metadata: { size: 1024, type: 'document' },
    })
    await embedded.preProcess(ctx as any)

    const result = await embedded.toTool(mockTool)

    assert.property(result, '_meta')
    assert.deepEqual(result._meta, {
      resourceInfo: {
        cached: true,
        cacheKey: 'abc123',
      },
      permissions: ['read', 'execute'],
      metadata: { size: 1024, type: 'document' },
    })
  })
})

test.group('EmbeddedResource Content - Error handling', () => {
  test('should throw error if toTool is called before preProcess', async ({ assert }) => {
    const embedded = new EmbeddedResource('file:///test.txt')

    try {
      await embedded.toTool(mockTool)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'Resource not found')
      assert.equal(error.code, 'E_RESOURCE_NOT_FOUND')
    }
  })

  test('should throw error if toPrompt is called before preProcess', async ({ assert }) => {
    const embedded = new EmbeddedResource('file:///test.txt')

    try {
      await embedded.toPrompt(mockPrompt)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'Resource not found')
      assert.equal(error.code, 'E_RESOURCE_NOT_FOUND')
    }
  })
})
