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

test.group('ListResourceTemplates Method', () => {
  test('should list resource templates successfully', async ({ assert }) => {
    const template1Path = new URL(template1Module, import.meta.url).href
    const template2Path = new URL(template2Module, import.meta.url).href

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resources: {
        'file:///users/{id}': template1Path,
        'file:///api{?page,limit}': template2Path,
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
      resources: {},
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
        'file:///test-resource-1.txt': resource1Path, // Regular resource (no template)
        'file:///test-resource-2.bin': resource2Path, // Regular resource (no template)
        'file:///users/{id}': template1Path, // Template
        'file:///api{?page,limit}': template2Path, // Template
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

    const resources: Record<string, string> = {}
    // Create multiple template entries
    for (let i = 0; i < 20; i++) {
      if (i % 3 === 0) {
        resources[`file:///users/{id${i}}`] = template1Path
      } else if (i % 3 === 1) {
        resources[`file:///api{?page${i},limit${i}}`] = template2Path
      } else {
        resources[`file:///users/{userId${i}}/posts/{postId${i}}`] = template3Path
      }
    }

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resources,
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
      resources,
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
      resources: {
        'file:///users/{id}': template1Path,
        'file:///api{?page,limit}': template2Path,
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

    const resources: Record<string, string> = {}
    // Create 30 template entries
    for (let i = 0; i < 30; i++) {
      resources[`file:///template/{id${i}}`] = i % 2 === 0 ? template1Path : template2Path
    }

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resources,
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
      resources: {
        'file:///users/{id}': template1Path,
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

    const resources: Record<string, string> = {}
    // Create 15 template entries
    for (let i = 0; i < 5; i++) {
      resources[`file:///users${i}/{id}`] = template1Path
    }
    for (let i = 0; i < 5; i++) {
      resources[`file:///api${i}{?page,limit}`] = template2Path
    }
    for (let i = 0; i < 5; i++) {
      resources[`file:///users${i}/{userId}/posts/{postId}`] = template3Path
    }

    const request = createListResourceTemplatesRequest()
    const context = createTestContext(request, {
      resources,
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
      resources,
      defaultPaginationLength: 5,
    })
    const page2 = await method.handle(context2)
    const page2Templates = page2.result?.resourceTemplates as any[]
    assert.equal(page2Templates.length, 5)
    assert.exists(page2.result?.nextCursor)

    // Get third page
    const request3 = createListResourceTemplatesRequest(page2.result?.nextCursor as string)
    const context3 = createTestContext(request3, {
      resources,
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
      resources: {
        'file:///users/{id}': template1Path,
        'file:///api{?page,limit}': template2Path,
        'file:///users/{userId}/posts/{postId}': template3Path,
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
      resources: {
        'file:///users/{id}': template1Path,
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
