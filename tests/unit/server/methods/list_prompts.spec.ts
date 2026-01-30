/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import ListPrompts from '../../../../src/server/methods/list_prompts.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createListPromptsRequest } from '../../../helpers/create_request.js'

// Import prompt fixtures using relative paths
const prompt1Module = '../../../fixtures/prompts/test_prompt_1.ts'
const prompt2Module = '../../../fixtures/prompts/test_prompt_2.ts'
const promptNoSchemaModule = '../../../fixtures/prompts/test_prompt_no_schema.ts'

// JSON payloads matching Prompt.toJson() output for each fixture
const prompt1Json: Record<string, unknown> = {
  name: 'test-prompt-1',
  title: 'Test Prompt 1',
  description: 'First test prompt',
  inputSchema: {
    type: 'object',
    properties: { text: { type: 'string', description: 'Text input' } },
    required: ['text'],
  },
}
const prompt2Json: Record<string, unknown> = {
  name: 'test-prompt-2',
  title: 'Test Prompt 2',
  description: 'Second test prompt',
  inputSchema: {
    type: 'object',
    properties: { number: { type: 'number', description: 'Number input' } },
    required: [],
  },
}
const promptNoSchemaJson: Record<string, unknown> = {
  name: 'test-prompt-no-schema',
  title: 'Test Prompt No Schema',
  description: 'Test prompt without schema',
  inputSchema: { type: 'object', properties: {} },
}

test.group('ListPrompts Method', () => {
  test('should list prompts successfully', async ({ assert }) => {
    const prompt1Path = new URL(prompt1Module, import.meta.url).href
    const prompt2Path = new URL(prompt2Module, import.meta.url).href

    const request = createListPromptsRequest()
    const context = createTestContext(request, {
      prompts: {
        'test-prompt-1': { path: prompt1Path, json: prompt1Json },
        'test-prompt-2': { path: prompt2Path, json: prompt2Json },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListPrompts()

    const response = await method.handle(context)

    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.prompts)
    assert.isArray(response.result?.prompts)
    assert.equal((response.result?.prompts as any[]).length, 2)

    const prompts = response.result?.prompts as any[]
    const prompt1 = prompts.find((p) => p.name === 'test-prompt-1')
    const prompt2 = prompts.find((p) => p.name === 'test-prompt-2')

    assert.exists(prompt1)
    assert.equal(prompt1.title, 'Test Prompt 1')
    assert.equal(prompt1.description, 'First test prompt')
    assert.exists(prompt1.inputSchema)
    assert.equal(prompt1.inputSchema.type, 'object')
    assert.exists(prompt1.inputSchema.properties.text)
    assert.deepEqual(prompt1.inputSchema.required, ['text'])

    assert.exists(prompt2)
    assert.equal(prompt2.title, 'Test Prompt 2')
    assert.equal(prompt2.description, 'Second test prompt')
    assert.exists(prompt2.inputSchema)
    assert.equal(prompt2.inputSchema.type, 'object')
    assert.exists(prompt2.inputSchema.properties.number)
    assert.deepEqual(prompt2.inputSchema.required, [])
  })

  test('should handle prompt without schema', async ({ assert }) => {
    const promptPath = new URL(promptNoSchemaModule, import.meta.url).href

    const request = createListPromptsRequest()
    const context = createTestContext(request, {
      prompts: {
        'test-prompt-no-schema': { path: promptPath, json: promptNoSchemaJson },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListPrompts()

    const response = await method.handle(context)

    assert.exists(response.result?.prompts)
    const prompts = response.result?.prompts as any[]
    assert.equal(prompts.length, 1)

    const prompt = prompts[0]
    assert.equal(prompt.name, 'test-prompt-no-schema')
    assert.exists(prompt.inputSchema)
    assert.equal(prompt.inputSchema.type, 'object')
    assert.deepEqual(prompt.inputSchema.properties, {})
    assert.deepEqual(prompt.inputSchema.required, undefined)
  })

  test('should return empty array when no prompts are registered', async ({ assert }) => {
    const request = createListPromptsRequest()
    const context = createTestContext(request, {
      prompts: {},
      defaultPaginationLength: 10,
    })
    const method = new ListPrompts()

    const response = await method.handle(context)

    assert.exists(response.result?.prompts)
    assert.isArray(response.result?.prompts)
    assert.equal((response.result?.prompts as any[]).length, 0)
    assert.notExists(response.result?.nextCursor)
  })

  test('should paginate prompts correctly', async ({ assert }) => {
    // Use the same prompt multiple times to simulate pagination
    const prompt1Path = new URL(prompt1Module, import.meta.url).href
    const prompt2Path = new URL(prompt2Module, import.meta.url).href

    const prompts: Record<string, { path: string; json: Record<string, unknown> }> = {}
    // Create 20 prompt entries using the two available prompts
    for (let i = 0; i < 20; i++) {
      prompts[`test-prompt-${i}`] = {
        path: i % 2 === 0 ? prompt1Path : prompt2Path,
        json: { name: `test-prompt-${i}` },
      }
    }

    const request = createListPromptsRequest()
    const context = createTestContext(request, {
      prompts,
      defaultPaginationLength: 5,
      maxPaginationLength: 10,
    })
    const method = new ListPrompts()

    const response = await method.handle(context)

    assert.exists(response.result?.prompts)
    const promptsList = response.result?.prompts as any[]
    assert.equal(promptsList.length, 5)
    assert.exists(response.result?.nextCursor)

    // Test second page
    const secondRequest = createListPromptsRequest(response.result?.nextCursor as string)
    const secondContext = createTestContext(secondRequest, {
      prompts,
      defaultPaginationLength: 5,
      maxPaginationLength: 10,
    })

    const secondResponse = await method.handle(secondContext)
    assert.exists(secondResponse.result?.prompts)
    assert.equal((secondResponse.result?.prompts as any[]).length, 5)
    assert.exists(secondResponse.result?.nextCursor)
  })

  test('should not include nextCursor when all prompts are returned', async ({ assert }) => {
    const prompt1Path = new URL(prompt1Module, import.meta.url).href
    const prompt2Path = new URL(prompt2Module, import.meta.url).href

    const request = createListPromptsRequest()
    const context = createTestContext(request, {
      prompts: {
        'test-prompt-1': { path: prompt1Path, json: prompt1Json },
        'test-prompt-2': { path: prompt2Path, json: prompt2Json },
      },
      defaultPaginationLength: 10,
    })
    const method = new ListPrompts()

    const response = await method.handle(context)

    assert.exists(response.result?.prompts)
    assert.equal((response.result?.prompts as any[]).length, 2)
    assert.notExists(response.result?.nextCursor)
  })

  test('should respect max pagination length', async ({ assert }) => {
    const prompt1Path = new URL(prompt1Module, import.meta.url).href
    const prompt2Path = new URL(prompt2Module, import.meta.url).href

    const prompts: Record<string, { path: string; json: Record<string, unknown> }> = {}
    // Create 30 prompt entries
    for (let i = 0; i < 30; i++) {
      prompts[`test-prompt-${i}`] = {
        path: i % 2 === 0 ? prompt1Path : prompt2Path,
        json: { name: `test-prompt-${i}` },
      }
    }

    const request = createListPromptsRequest()
    const context = createTestContext(request, {
      prompts,
      defaultPaginationLength: 20, // Request more than max
      maxPaginationLength: 10, // But max is 10
    })
    const method = new ListPrompts()

    const response = await method.handle(context)

    assert.exists(response.result?.prompts)
    const promptsList = response.result?.prompts as any[]
    assert.equal(promptsList.length, 10) // Should be limited to max
    assert.exists(response.result?.nextCursor)
  })
})
