/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import ListTools from '../../../../src/server/methods/list_tools.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createListToolsRequest } from '../../../helpers/create_request.js'

// Import tool fixtures using relative paths
const tool1Module = '../../../fixtures/tools/test_tool_1.ts'
const tool2Module = '../../../fixtures/tools/test_tool_2.ts'
const toolNoSchemaModule = '../../../fixtures/tools/test_tool_no_schema.ts'

// JSON payloads matching Tool.toJson() output for each fixture
const tool1Json: Record<string, unknown> = {
  name: 'test-tool-1',
  title: 'Test Tool 1',
  description: 'First test tool',
  inputSchema: {
    type: 'object',
    properties: { text: { type: 'string', description: 'Text input' } },
    required: ['text'],
  },
}
const tool2Json: Record<string, unknown> = {
  name: 'test-tool-2',
  title: 'Test Tool 2',
  description: 'Second test tool',
  inputSchema: {
    type: 'object',
    properties: { number: { type: 'number', description: 'Number input' } },
    required: [],
  },
}
const toolNoSchemaJson: Record<string, unknown> = {
  name: 'test-tool-no-schema',
  title: 'Test Tool No Schema',
  description: 'Tool without schema',
  inputSchema: { type: 'object', properties: {} },
}

test.group('ListTools Method', () => {
  test('should list tools successfully', async ({ assert }) => {
    const tool1Path = new URL(tool1Module, import.meta.url).href
    const tool2Path = new URL(tool2Module, import.meta.url).href

    const request = createListToolsRequest()
    const context = createTestContext(request, {
      tools: {
        'test-tool-1': { path: tool1Path, json: tool1Json },
        'test-tool-2': { path: tool2Path, json: tool2Json },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListTools()

    const response = await method.handle(context)

    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.tools)
    assert.isArray(response.result?.tools)
    assert.equal((response.result?.tools as any[]).length, 2)

    const tools = response.result?.tools as any[]
    const tool1 = tools.find((t) => t.name === 'test-tool-1')
    const tool2 = tools.find((t) => t.name === 'test-tool-2')

    assert.exists(tool1)
    assert.equal(tool1.title, 'Test Tool 1')
    assert.equal(tool1.description, 'First test tool')
    assert.exists(tool1.inputSchema)
    assert.equal(tool1.inputSchema.type, 'object')
    assert.exists(tool1.inputSchema.properties.text)
    assert.deepEqual(tool1.inputSchema.required, ['text'])

    assert.exists(tool2)
    assert.equal(tool2.title, 'Test Tool 2')
    assert.equal(tool2.description, 'Second test tool')
    assert.exists(tool2.inputSchema)
    assert.equal(tool2.inputSchema.type, 'object')
    assert.exists(tool2.inputSchema.properties.number)
    assert.deepEqual(tool2.inputSchema.required, [])
  })

  test('should handle tool without schema', async ({ assert }) => {
    const toolPath = new URL(toolNoSchemaModule, import.meta.url).href

    const request = createListToolsRequest()
    const context = createTestContext(request, {
      tools: {
        'test-tool-no-schema': { path: toolPath, json: toolNoSchemaJson },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListTools()

    const response = await method.handle(context)

    assert.exists(response.result?.tools)
    const tools = response.result?.tools as any[]
    assert.equal(tools.length, 1)

    const tool = tools[0]
    assert.equal(tool.name, 'test-tool-no-schema')
    assert.exists(tool.inputSchema)
    assert.equal(tool.inputSchema.type, 'object')
    assert.deepEqual(tool.inputSchema.properties, {})
    assert.deepEqual(tool.inputSchema.required, undefined)
  })

  test('should return empty array when no tools are registered', async ({ assert }) => {
    const request = createListToolsRequest()
    const context = createTestContext(request, {
      tools: {},
      defaultPaginationLength: 10,
    })
    const method = new ListTools()

    const response = await method.handle(context)

    assert.exists(response.result?.tools)
    assert.isArray(response.result?.tools)
    assert.equal((response.result?.tools as any[]).length, 0)
    assert.notExists(response.result?.nextCursor)
  })

  test('should paginate tools correctly', async ({ assert }) => {
    // Use the same tool multiple times to simulate pagination
    const tool1Path = new URL(tool1Module, import.meta.url).href
    const tool2Path = new URL(tool2Module, import.meta.url).href

    const tools: Record<string, { path: string; json: Record<string, unknown> }> = {}
    // Create 20 tool entries using the two available tools
    for (let i = 0; i < 20; i++) {
      tools[`test-tool-${i}`] = {
        path: i % 2 === 0 ? tool1Path : tool2Path,
        json: { name: `test-tool-${i}` },
      }
    }

    const request = createListToolsRequest()
    const context = createTestContext(request, {
      tools,
      defaultPaginationLength: 5,
      maxPaginationLength: 10,
    })
    const method = new ListTools()

    const response = await method.handle(context)

    assert.exists(response.result?.tools)
    const toolsList = response.result?.tools as any[]
    assert.equal(toolsList.length, 5)
    assert.exists(response.result?.nextCursor)

    // Test second page
    const secondRequest = createListToolsRequest(response.result?.nextCursor as string)
    const secondContext = createTestContext(secondRequest, {
      tools,
      defaultPaginationLength: 5,
      maxPaginationLength: 10,
    })

    const secondResponse = await method.handle(secondContext)
    assert.exists(secondResponse.result?.tools)
    assert.equal((secondResponse.result?.tools as any[]).length, 5)
    assert.exists(secondResponse.result?.nextCursor)
  })

  test('should not include nextCursor when all tools are returned', async ({ assert }) => {
    const tool1Path = new URL(tool1Module, import.meta.url).href
    const tool2Path = new URL(tool2Module, import.meta.url).href

    const request = createListToolsRequest()
    const context = createTestContext(request, {
      tools: {
        'test-tool-1': { path: tool1Path, json: tool1Json },
        'test-tool-2': { path: tool2Path, json: tool2Json },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListTools()

    const response = await method.handle(context)

    assert.exists(response.result?.tools)
    assert.equal((response.result?.tools as any[]).length, 2)
    assert.notExists(response.result?.nextCursor)
  })

  test('should respect max pagination length', async ({ assert }) => {
    const tool1Path = new URL(tool1Module, import.meta.url).href
    const tool2Path = new URL(tool2Module, import.meta.url).href

    const tools: Record<string, { path: string; json: Record<string, unknown> }> = {}
    // Create 30 tool entries
    for (let i = 0; i < 30; i++) {
      tools[`test-tool-${i}`] = {
        path: i % 2 === 0 ? tool1Path : tool2Path,
        json: { name: `test-tool-${i}` },
      }
    }

    const request = createListToolsRequest()
    const context = createTestContext(request, {
      tools,
      defaultPaginationLength: 20, // Request more than max
      maxPaginationLength: 10, // But max is 10
    })
    const method = new ListTools()

    const response = await method.handle(context)

    assert.exists(response.result?.tools)
    const toolsList = response.result?.tools as any[]
    assert.equal(toolsList.length, 10) // Should be limited to max
    assert.exists(response.result?.nextCursor)
  })
})
