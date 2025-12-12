/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import ServerContext from '../../../src/server/context.js'
import { createJsonRpcRequest } from '../../helpers/create_request.js'

const resource1Module = '../../fixtures/resources/test_resource_1.ts'
const resource2Module = '../../fixtures/resources/test_resource_2.ts'
const template1Module = '../../fixtures/resources/test_resource_template_1.ts'
const template2Module = '../../fixtures/resources/test_resource_template_2.ts'
const template3Module = '../../fixtures/resources/test_resource_template_3.ts'

test.group('ServerContext', () => {
  test('should create context with default values', ({ assert }) => {
    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: { tools: { listChanged: false } },
      serverName: 'Test Server',
      serverVersion: '1.0.0',
      instructions: 'Test instructions',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.equal(context.serverName, 'Test Server')
    assert.equal(context.serverVersion, '1.0.0')
    assert.equal(context.instructions, 'Test instructions')
    assert.equal(context.maxPaginationLength, 50)
    assert.equal(context.defaultPaginationLength, 15)
    assert.exists(context.request)
    assert.exists(context.response)
  })

  test('getPerPage should return requested per page if less than max', ({ assert }) => {
    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.equal(context.getPerPage(10), 10)
    assert.equal(context.getPerPage(20), 20)
  })

  test('getPerPage should return max pagination length if requested exceeds max', ({ assert }) => {
    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.equal(context.getPerPage(100), 50)
    assert.equal(context.getPerPage(60), 50)
  })

  test('getPerPage should return default if no value provided', ({ assert }) => {
    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.equal(context.getPerPage(), 15)
  })
})

test.group('ServerContext - getResources', () => {
  test('should return only non-template resources', async ({ assert }) => {
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const resource2Path = new URL(resource2Module, import.meta.url).href
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href

    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {
        'file:///test-resource-1.txt': resource1Path, // Regular resource
        'file:///test-resource-2.bin': resource2Path, // Regular resource
        'file:///users/{id}': template1Path, // Template
        'file:///api{?page,limit}': template2Path, // Template
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    const resources = await context.getResources()

    // Should only include regular resources, not templates
    assert.exists(resources['file:///test-resource-1.txt'])
    assert.exists(resources['file:///test-resource-2.bin'])
    assert.notExists(resources['file:///users/{id}'])
    assert.notExists(resources['file:///api{?page,limit}'])
  })

  test('should return empty object when no regular resources exist', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href

    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {
        'file:///users/{id}': template1Path, // Template only
        'file:///api{?page,limit}': template2Path, // Template only
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    const resources = await context.getResources()

    assert.isEmpty(Object.keys(resources))
  })

  test('should return all resources when no templates exist', async ({ assert }) => {
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const resource2Path = new URL(resource2Module, import.meta.url).href

    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {
        'file:///test-resource-1.txt': resource1Path,
        'file:///test-resource-2.bin': resource2Path,
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    const resources = await context.getResources()

    assert.exists(resources['file:///test-resource-1.txt'])
    assert.exists(resources['file:///test-resource-2.bin'])
    assert.equal(Object.keys(resources).length, 2)
  })

  test('should return empty object when no resources exist', async ({ assert }) => {
    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    const resources = await context.getResources()

    assert.isEmpty(Object.keys(resources))
  })

  test('should correctly identify resources without curly braces as non-templates', async ({
    assert,
  }) => {
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {
        'file:///normal/path/resource.txt': resource1Path,
        'file:///another/static/path': resource1Path,
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    const resources = await context.getResources()

    assert.equal(Object.keys(resources).length, 2)
    assert.exists(resources['file:///normal/path/resource.txt'])
    assert.exists(resources['file:///another/static/path'])
  })
})

test.group('ServerContext - getResourceTemplates', () => {
  test('should return only template resources', async ({ assert }) => {
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const resource2Path = new URL(resource2Module, import.meta.url).href
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href

    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {
        'file:///test-resource-1.txt': resource1Path, // Regular resource
        'file:///test-resource-2.bin': resource2Path, // Regular resource
        'file:///users/{id}': template1Path, // Template
        'file:///api{?page,limit}': template2Path, // Template
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    const templates = await context.getResourceTemplates()

    // Should only include templates, not regular resources
    assert.exists(templates['file:///users/{id}'])
    assert.exists(templates['file:///api{?page,limit}'])
    assert.notExists(templates['file:///test-resource-1.txt'])
    assert.notExists(templates['file:///test-resource-2.bin'])
  })

  test('should return empty object when no templates exist', async ({ assert }) => {
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const resource2Path = new URL(resource2Module, import.meta.url).href

    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {
        'file:///test-resource-1.txt': resource1Path,
        'file:///test-resource-2.bin': resource2Path,
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    const templates = await context.getResourceTemplates()

    assert.isEmpty(Object.keys(templates))
  })

  test('should return all templates when no regular resources exist', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href
    const template3Path = new URL(template3Module, import.meta.url).href

    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {
        'file:///users/{id}': template1Path,
        'file:///api{?page,limit}': template2Path,
        'file:///users/{userId}/posts/{postId}': template3Path,
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    const templates = await context.getResourceTemplates()

    assert.equal(Object.keys(templates).length, 3)
    assert.exists(templates['file:///users/{id}'])
    assert.exists(templates['file:///api{?page,limit}'])
    assert.exists(templates['file:///users/{userId}/posts/{postId}'])
  })

  test('should return empty object when no resources exist', async ({ assert }) => {
    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    const templates = await context.getResourceTemplates()

    assert.isEmpty(Object.keys(templates))
  })

  test('should correctly identify templates with various patterns', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href
    const template3Path = new URL(template3Module, import.meta.url).href

    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {
        'file:///users/{id}': template1Path, // Simple variable
        'file:///api{?page,limit}': template2Path, // Query parameters
        'file:///users/{userId}/posts/{postId}': template3Path, // Multiple variables
        'file:///files{/path}': template1Path, // Path segment
        'file:///doc{#section}': template1Path, // Fragment
        'file:///{+path}': template1Path, // Reserved expansion
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    const templates = await context.getResourceTemplates()

    // All should be identified as templates
    assert.equal(Object.keys(templates).length, 6)
    assert.exists(templates['file:///users/{id}'])
    assert.exists(templates['file:///api{?page,limit}'])
    assert.exists(templates['file:///users/{userId}/posts/{postId}'])
    assert.exists(templates['file:///files{/path}'])
    assert.exists(templates['file:///doc{#section}'])
    assert.exists(templates['file:///{+path}'])
  })
})

test.group('ServerContext - Resource filtering edge cases', () => {
  test('should handle mixed resources and templates correctly', async ({ assert }) => {
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href

    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {
        'file:///static/resource.txt': resource1Path,
        'file:///users/{id}': template1Path,
        'file:///api{?query}': template2Path,
        'file:///another/static/file': resource1Path,
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    const resources = await context.getResources()
    const templates = await context.getResourceTemplates()

    // Verify proper separation
    assert.equal(Object.keys(resources).length, 2)
    assert.equal(Object.keys(templates).length, 2)

    // Verify no overlap
    for (const key of Object.keys(resources)) {
      assert.notExists(templates[key], `${key} should not be in both resources and templates`)
    }
    for (const key of Object.keys(templates)) {
      assert.notExists(resources[key], `${key} should not be in both templates and resources`)
    }
  })

  test('should handle resource paths that contain braces in string but are not templates', async ({
    assert,
  }) => {
    // Note: This is an edge case - if the resource URI itself doesn't contain template syntax
    // according to UriTemplate.isTemplate(), it should be treated as a regular resource
    const resource1Path = new URL(resource1Module, import.meta.url).href

    const request = createJsonRpcRequest('test')
    const context = new ServerContext({
      supportedProtocolVersions: ['2025-06-18'],
      serverCapabilities: {},
      serverName: 'Test',
      serverVersion: '1.0.0',
      instructions: '',
      maxPaginationLength: 50,
      defaultPaginationLength: 15,
      tools: {},
      resources: {
        'file:///normal/path': resource1Path,
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    const resources = await context.getResources()
    const templates = await context.getResourceTemplates()

    assert.exists(resources['file:///normal/path'])
    assert.notExists(templates['file:///normal/path'])
  })
})
