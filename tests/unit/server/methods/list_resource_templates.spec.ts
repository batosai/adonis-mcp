/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import ListResourceTemplates from '../../../../src/server/methods/list_resource_templates.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createListResourceTemplatesRequest } from '../../../helpers/create_request.js'

// Import resource fixtures using relative paths
const resource1Module = '../../../fixtures/resources/test_resource_1.ts'
const resource2Module = '../../../fixtures/resources/test_resource_2.ts'
const template1Module = '../../../fixtures/resources/test_resource_template_1.ts'
const template2Module = '../../../fixtures/resources/test_resource_template_2.ts'
const template3Module = '../../../fixtures/resources/test_resource_template_3.ts'

// JSON payloads matching Resource.toJson() for templates (uriTemplate, not uri)
const template1Json: Record<string, unknown> = {
  name: 'test-resource-template-1',
  title: 'Test Resource Template 1',
  description: 'Resource template with simple variable',
  uriTemplate: 'file:///users/{id}',
  mimeType: 'text/plain',
}
const template2Json: Record<string, unknown> = {
  name: 'test-resource-template-2',
  title: 'Test Resource Template 2',
  description: 'Resource template with query parameters',
  uriTemplate: 'file:///api{?page,limit}',
  mimeType: 'application/json',
}
const template3Json: Record<string, unknown> = {
  name: 'test-resource-template-3',
  title: 'Test Resource Template 3',
  description: 'Resource template with multiple path variables',
  uriTemplate: 'file:///users/{userId}/posts/{postId}',
  mimeType: 'text/plain',
}

test.group('ListResourceTemplates Method', () => {
  test('should list resource templates successfully', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resourceTemplates: {
        'file:///users/{id}': { path: template1Path, json: template1Json },
        'file:///api{?page,limit}': { path: template2Path, json: template2Json },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListResourceTemplates()

    const response = await method.handle(context)

    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.resourceTemplates)
    assert.isArray(response.result?.resourceTemplates)
    assert.equal((response.result?.resourceTemplates as any[]).length, 2)

    const templates = response.result?.resourceTemplates as any[]
    const template1 = templates.find((r) => r.name === 'test-resource-template-1')
    const template2 = templates.find((r) => r.name === 'test-resource-template-2')

    assert.exists(template1)
    assert.equal(template1.name, 'test-resource-template-1')
    assert.equal(template1.title, 'Test Resource Template 1')
    assert.equal(template1.description, 'Resource template with simple variable')
    assert.equal(template1.mimeType, 'text/plain')
    assert.equal(template1.uriTemplate, 'file:///users/{id}')
    assert.notExists(template1.uri) // Should have uriTemplate, not uri

    assert.exists(template2)
    assert.equal(template2.name, 'test-resource-template-2')
    assert.equal(template2.title, 'Test Resource Template 2')
    assert.equal(template2.description, 'Resource template with query parameters')
    assert.equal(template2.mimeType, 'application/json')
    assert.equal(template2.uriTemplate, 'file:///api{?page,limit}')
    assert.notExists(template2.uri) // Should have uriTemplate, not uri
  })

  test('should return empty array when no resource templates exist', async ({ assert }) => {
    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resourceTemplates: {},
      defaultPaginationLength: 10,
    })
    const method = new ListResourceTemplates()

    const response = await method.handle(context)

    assert.exists(response.result?.resourceTemplates)
    assert.isArray(response.result?.resourceTemplates)
    assert.equal((response.result?.resourceTemplates as any[]).length, 0)
    assert.notExists(response.result?.nextCursor)
  })

  test('should only return templates and not regular resources', async ({ assert }) => {
    const resource1Path = new URL(resource1Module, import.meta.url).href
    const resource2Path = new URL(resource2Module, import.meta.url).href
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resources: {
        'file:///test-resource-1.txt': { path: resource1Path, json: { uri: 'file:///test-resource-1.txt', name: 'test-resource-1' } }, // Regular resource (no template)
        'file:///test-resource-2.bin': { path: resource2Path, json: { uri: 'file:///test-resource-2.bin', name: 'test-resource-2' } }, // Regular resource (no template)
      },
      resourceTemplates: {
        'file:///users/{id}': { path: template1Path, json: template1Json }, // Template
        'file:///api{?page,limit}': { path: template2Path, json: template2Json }, // Template
      },
      defaultPaginationLength: 10,
    })
    const method = new ListResourceTemplates()

    const response = await method.handle(context)

    assert.exists(response.result?.resourceTemplates)
    const templates = response.result?.resourceTemplates as any[]
    assert.equal(templates.length, 2) // Only templates, not regular resources

    const templateNames = templates.map((t) => t.name)
    assert.includeMembers(templateNames, ['test-resource-template-1', 'test-resource-template-2'])
    assert.notIncludeMembers(templateNames, ['test-resource-1', 'test-resource-2'])
  })

  test('should paginate resource templates correctly', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href
    const template3Path = new URL(template3Module, import.meta.url).href

    const resourceTemplates: Record<string, { path: string; json: Record<string, unknown> }> = {}
    // Create multiple template entries
    for (let i = 0; i < 20; i++) {
      if (i % 3 === 0) {
        resourceTemplates[`file:///users/{id${i}}`] = {
          path: template1Path,
          json: { name: `test-resource-template-${i}`, uriTemplate: `file:///users/{id${i}}` },
        }
      } else if (i % 3 === 1) {
        resourceTemplates[`file:///api{?page${i},limit${i}}`] = {
          path: template2Path,
          json: { name: `test-resource-template-${i}`, uriTemplate: `file:///api{?page${i},limit${i}}` },
        }
      } else {
        resourceTemplates[`file:///users/{userId${i}}/posts/{postId${i}}`] = {
          path: template3Path,
          json: { name: `test-resource-template-${i}`, uriTemplate: `file:///users/{userId${i}}/posts/{postId${i}}` },
        }
      }
    }

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resourceTemplates,
      defaultPaginationLength: 5,
      maxPaginationLength: 10,
    })
    const method = new ListResourceTemplates()

    const response = await method.handle(context)

    assert.exists(response.result?.resourceTemplates)
    const templatesList = response.result?.resourceTemplates as any[]
    assert.equal(templatesList.length, 5)
    assert.exists(response.result?.nextCursor)

    // Test second page
    const secondRequest = createListResourceTemplatesRequest(response.result?.nextCursor as string)
    const secondContext = createTestContext(secondRequest, {
      resourceTemplates,
      defaultPaginationLength: 5,
      maxPaginationLength: 10,
    })

    const secondResponse = await method.handle(secondContext)
    assert.exists(secondResponse.result?.resourceTemplates)
    assert.equal((secondResponse.result?.resourceTemplates as any[]).length, 5)
    assert.exists(secondResponse.result?.nextCursor)
  })

  test('should not include nextCursor when all templates are returned', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resourceTemplates: {
        'file:///users/{id}': { path: template1Path, json: template1Json },
        'file:///api{?page,limit}': { path: template2Path, json: template2Json },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListResourceTemplates()

    const response = await method.handle(context)

    assert.exists(response.result?.resourceTemplates)
    assert.equal((response.result?.resourceTemplates as any[]).length, 2)
    assert.notExists(response.result?.nextCursor)
  })

  test('should respect max pagination length', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href

    const resourceTemplates: Record<string, { path: string; json: Record<string, unknown> }> = {}
    // Create 30 template entries
    for (let i = 0; i < 30; i++) {
      resourceTemplates[`file:///template/{id${i}}`] = {
        path: i % 2 === 0 ? template1Path : template2Path,
        json: {},
      }
    }

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resourceTemplates,
      defaultPaginationLength: 20, // Request more than max
      maxPaginationLength: 10, // But max is 10
    })
    const method = new ListResourceTemplates()

    const response = await method.handle(context)

    assert.exists(response.result?.resourceTemplates)
    const templatesList = response.result?.resourceTemplates as any[]
    assert.equal(templatesList.length, 10) // Should be limited to max
    assert.exists(response.result?.nextCursor)
  })

  test('should return correct response format', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resourceTemplates: {
        'file:///users/{id}': { path: template1Path, json: {} },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListResourceTemplates()

    const response = await method.handle(context)

    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.property(response.result, 'resourceTemplates')
    assert.notProperty(response.result, 'resources') // Should be resourceTemplates, not resources
  })

  test('should handle cursor pagination correctly', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href
    const template3Path = new URL(template3Module, import.meta.url).href

    const resourceTemplates: Record<string, { path: string; json: Record<string, unknown> }> = {}
    // Create 15 template entries
    for (let i = 0; i < 5; i++) {
      resourceTemplates[`file:///users${i}/{id}`] = { path: template1Path, json: {} }
    }
    for (let i = 0; i < 5; i++) {
      resourceTemplates[`file:///api${i}{?page,limit}`] = { path: template2Path, json: {} }
    }
    for (let i = 0; i < 5; i++) {
      resourceTemplates[`file:///users${i}/{userId}/posts/{postId}`] = {
        path: template3Path,
        json: {},
      }
    }

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resourceTemplates,
      defaultPaginationLength: 5,
    })
    const method = new ListResourceTemplates()

    // Get first page
    const page1 = await method.handle(context)
    const page1Templates = page1.result?.resourceTemplates as any[]
    assert.equal(page1Templates.length, 5)
    assert.exists(page1.result?.nextCursor)

    // Get second page
    const request2 = createListResourceTemplatesRequest(page1.result?.nextCursor as string)
    const context2 = createTestContext(request2, {
      resourceTemplates,
      defaultPaginationLength: 5,
    })
    const page2 = await method.handle(context2)
    const page2Templates = page2.result?.resourceTemplates as any[]
    assert.equal(page2Templates.length, 5)
    assert.exists(page2.result?.nextCursor)

    // Get third page
    const request3 = createListResourceTemplatesRequest(page2.result?.nextCursor as string)
    const context3 = createTestContext(request3, {
      resourceTemplates,
      defaultPaginationLength: 5,
    })
    const page3 = await method.handle(context3)
    const page3Templates = page3.result?.resourceTemplates as any[]
    assert.equal(page3Templates.length, 5)
    assert.notExists(page3.result?.nextCursor) // Last page

    // Verify we got all 15 templates across pages
    const totalTemplates = page1Templates.length + page2Templates.length + page3Templates.length
    assert.equal(totalTemplates, 15)
  })

  test('should have uriTemplate property instead of uri for templates', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href
    const template3Path = new URL(template3Module, import.meta.url).href

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resourceTemplates: {
        'file:///users/{id}': { path: template1Path, json: template1Json },
        'file:///api{?page,limit}': { path: template2Path, json: template2Json },
        'file:///users/{userId}/posts/{postId}': { path: template3Path, json: template3Json },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListResourceTemplates()

    const response = await method.handle(context)
    const templates = response.result?.resourceTemplates as any[]

    // All templates should have uriTemplate, not uri
    for (const template of templates) {
      assert.exists(template.uriTemplate, `Template ${template.name} should have uriTemplate`)
      assert.notExists(template.uri, `Template ${template.name} should not have uri property`)
      assert.isTrue(
        template.uriTemplate.includes('{'),
        `Template ${template.name} uriTemplate should contain variable placeholder`
      )
    }
  })

  test('should include all resource metadata', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resourceTemplates: {
        'file:///users/{id}': { path: template1Path, json: template1Json },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListResourceTemplates()

    const response = await method.handle(context)
    const templates = response.result?.resourceTemplates as any[]
    const template = templates[0]

    // Verify all expected properties are present
    assert.exists(template.name)
    assert.exists(template.title)
    assert.exists(template.description)
    assert.exists(template.mimeType)
    assert.exists(template.uriTemplate)
    // size may or may not be present depending on resource definition
  })
})
