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

function entry(path: string) {
  return { path, json: {} }
}

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
      resourceTemplates: {},
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
      resourceTemplates: {},
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
      resourceTemplates: {},
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
      resourceTemplates: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.equal(context.getPerPage(), 15)
  })
})

test.group('ServerContext - getResources', () => {
  test('should return only non-template resources', ({ assert }) => {
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
        'file:///test-resource-1.txt': entry(resource1Path),
        'file:///test-resource-2.bin': entry(resource2Path),
      },
      resourceTemplates: {
        'file:///users/{id}': entry(template1Path),
        'file:///api{?page,limit}': entry(template2Path),
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    // Should only include regular resources, not templates
    assert.exists(context.resources['file:///test-resource-1.txt'])
    assert.exists(context.resources['file:///test-resource-2.bin'])
    assert.notExists(context.resources['file:///users/{id}'])
    assert.notExists(context.resources['file:///api{?page,limit}'])
  })

  test('should return empty object when no regular resources exist', ({ assert }) => {
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
      resources: {},
      resourceTemplates: {
        'file:///users/{id}': entry(template1Path),
        'file:///api{?page,limit}': entry(template2Path),
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.isEmpty(Object.keys(context.resources))
  })

  test('should return all resources when no templates exist', ({ assert }) => {
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
        'file:///test-resource-1.txt': entry(resource1Path),
        'file:///test-resource-2.bin': entry(resource2Path),
      },
      resourceTemplates: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.exists(context.resources['file:///test-resource-1.txt'])
    assert.exists(context.resources['file:///test-resource-2.bin'])
    assert.equal(Object.keys(context.resources).length, 2)
  })

  test('should return empty object when no resources exist', ({ assert }) => {
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
      resourceTemplates: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.isEmpty(Object.keys(context.resources))
  })

  test('should correctly identify resources without curly braces as non-templates', ({
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
        'file:///normal/path/resource.txt': entry(resource1Path),
        'file:///another/static/path': entry(resource1Path),
      },
      resourceTemplates: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.equal(Object.keys(context.resources).length, 2)
    assert.exists(context.resources['file:///normal/path/resource.txt'])
    assert.exists(context.resources['file:///another/static/path'])
  })
})

test.group('ServerContext - getResourceTemplates', () => {
  test('should return only template resources', ({ assert }) => {
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
        'file:///test-resource-1.txt': entry(resource1Path),
        'file:///test-resource-2.bin': entry(resource2Path),
      },
      resourceTemplates: {
        'file:///users/{id}': entry(template1Path),
        'file:///api{?page,limit}': entry(template2Path),
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    // Should only include templates, not regular resources
    assert.exists(context.resourceTemplates['file:///users/{id}'])
    assert.exists(context.resourceTemplates['file:///api{?page,limit}'])
    assert.notExists(context.resourceTemplates['file:///test-resource-1.txt'])
    assert.notExists(context.resourceTemplates['file:///test-resource-2.bin'])
  })

  test('should return empty object when no templates exist', ({ assert }) => {
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
        'file:///test-resource-1.txt': entry(resource1Path),
        'file:///test-resource-2.bin': entry(resource2Path),
      },
      resourceTemplates: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.isEmpty(Object.keys(context.resourceTemplates))
  })

  test('should return all templates when no regular resources exist', ({ assert }) => {
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
      resources: {},
      resourceTemplates: {
        'file:///users/{id}': entry(template1Path),
        'file:///api{?page,limit}': entry(template2Path),
        'file:///users/{userId}/posts/{postId}': entry(template3Path),
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.equal(Object.keys(context.resourceTemplates).length, 3)
    assert.exists(context.resourceTemplates['file:///users/{id}'])
    assert.exists(context.resourceTemplates['file:///api{?page,limit}'])
    assert.exists(context.resourceTemplates['file:///users/{userId}/posts/{postId}'])
  })

  test('should return empty object when no resources exist', ({ assert }) => {
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
      resourceTemplates: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.isEmpty(Object.keys(context.resourceTemplates))
  })

  test('should correctly identify templates with various patterns', ({ assert }) => {
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
      resources: {},
      resourceTemplates: {
        'file:///users/{id}': entry(template1Path),
        'file:///api{?page,limit}': entry(template2Path),
        'file:///users/{userId}/posts/{postId}': entry(template3Path),
        'file:///files{/path}': entry(template1Path),
        'file:///doc{#section}': entry(template1Path),
        'file:///{+path}': entry(template1Path),
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    // All should be in resourceTemplates
    assert.equal(Object.keys(context.resourceTemplates).length, 6)
    assert.exists(context.resourceTemplates['file:///users/{id}'])
    assert.exists(context.resourceTemplates['file:///api{?page,limit}'])
    assert.exists(context.resourceTemplates['file:///users/{userId}/posts/{postId}'])
    assert.exists(context.resourceTemplates['file:///files{/path}'])
    assert.exists(context.resourceTemplates['file:///doc{#section}'])
    assert.exists(context.resourceTemplates['file:///{+path}'])
  })
})

test.group('ServerContext - Resource filtering edge cases', () => {
  test('should handle mixed resources and templates correctly', ({ assert }) => {
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
        'file:///static/resource.txt': entry(resource1Path),
        'file:///another/static/file': entry(resource1Path),
      },
      resourceTemplates: {
        'file:///users/{id}': entry(template1Path),
        'file:///api{?query}': entry(template2Path),
      },
      prompts: {},
      jsonRpcRequest: request,
    })

    // Verify proper separation
    assert.equal(Object.keys(context.resources).length, 2)
    assert.equal(Object.keys(context.resourceTemplates).length, 2)

    // Verify no overlap
    for (const key of Object.keys(context.resources)) {
      assert.notExists(
        context.resourceTemplates[key],
        `${key} should not be in both resources and templates`
      )
    }
    for (const key of Object.keys(context.resourceTemplates)) {
      assert.notExists(
        context.resources[key],
        `${key} should not be in both templates and resources`
      )
    }
  })

  test('should handle resource paths that contain braces in string but are not templates', ({
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
        'file:///normal/path': entry(resource1Path),
      },
      resourceTemplates: {},
      prompts: {},
      jsonRpcRequest: request,
    })

    assert.exists(context.resources['file:///normal/path'])
    assert.notExists(context.resourceTemplates['file:///normal/path'])
  })
})
