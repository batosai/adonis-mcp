/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import ListTools from '../../../../src/server/methods/list_tools.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createListToolsRequest } from '../../../helpers/create_request.js'
import { ErrorCode } from '../../../../src/enums/error.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const fixturesDir = join(__dirname, '../../fixtures/tools')

// Import tool fixtures using relative paths
const tool1Module = '../../../fixtures/tools/test_tool_1.ts'
const tool2Module = '../../../fixtures/tools/test_tool_2.ts'
const toolNoSchemaModule = '../../../fixtures/tools/test_tool_no_schema.ts'

test.group('ListTools Method', () => {
  test('should list tools successfully', async ({ assert }) => {
    const tool1Path = new URL(tool1Module, import.meta.url).href
    const tool2Path = new URL(tool2Module, import.meta.url).href

    const request = createListToolsRequest()
    const context = createTestContext(request, {
      tools: {
        'test-tool-1': tool1Path,
        'test-tool-2': tool2Path,
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
        'test-tool-no-schema': toolPath,
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
    assert.deepEqual(tool.inputSchema.required, [])
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

    const tools: Record<string, string> = {}
    // Create 20 tool entries using the two available tools
    for (let i = 0; i < 20; i++) {
      tools[`test-tool-${i}`] = i % 2 === 0 ? tool1Path : tool2Path
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
        'test-tool-1': tool1Path,
        'test-tool-2': tool2Path,
      },
      defaultPaginationLength: 10,
    })
    const method = new ListTools()

    const response = await method.handle(context)

    assert.exists(response.result?.tools)
    assert.equal((response.result?.tools as any[]).length, 2)
    assert.notExists(response.result?.nextCursor)
  })

  test('should throw error when tool import fails', async ({ assert }) => {
    const toolPath = pathToFileURL(join(fixturesDir, 'nonexistent-tool.ts')).href

    const request = createListToolsRequest()
    const context = createTestContext(request, {
      tools: {
        'nonexistent-tool': toolPath,
      },
      defaultPaginationLength: 10,
    })
    const method = new ListTools()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.InternalError)
      assert.equal(error.requestId, request.id)
      assert.exists(error.data)
    }
  })

  test('should respect max pagination length', async ({ assert }) => {
    const tool1Path = new URL(tool1Module, import.meta.url).href
    const tool2Path = new URL(tool2Module, import.meta.url).href

    const tools: Record<string, string> = {}
    // Create 30 tool entries
    for (let i = 0; i < 30; i++) {
      tools[`test-tool-${i}`] = i % 2 === 0 ? tool1Path : tool2Path
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

