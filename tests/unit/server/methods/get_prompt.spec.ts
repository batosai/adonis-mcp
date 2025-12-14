/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { PromptContext } from '../../../../src/types/context.js'

import { test } from '@japa/runner'
import GetPrompt from '../../../../src/server/methods/get_prompt.js'
import { createTestContext } from '../../../helpers/create_context.js'
import { createPromptsGetRequest, createJsonRpcRequest } from '../../../helpers/create_request.js'
import { ErrorCode } from '../../../../src/enums/error.js'

// Import prompt fixtures using relative paths
const prompt1Module = '../../../fixtures/prompts/test_prompt_1.ts'
const prompt2Module = '../../../fixtures/prompts/test_prompt_2.ts'
const promptMultipleModule = '../../../fixtures/prompts/test_prompt_multiple.ts'

test.group('GetPrompt Method', () => {
  test('should throw error when prompt name is missing', async ({ assert }) => {
    const request = createJsonRpcRequest('prompts/get', {})
    const context = createTestContext(request) as PromptContext
    const method = new GetPrompt()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.InvalidParams)
      assert.equal(error.requestId, request.id)
    }
  })

  test('should throw error when prompt is not found', async ({ assert }) => {
    const request = createPromptsGetRequest('non-existent-prompt')
    const context = createTestContext(request, {
      prompts: {},
    }) as PromptContext
    const method = new GetPrompt()

    try {
      await method.handle(context)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.equal(error.code, ErrorCode.MethodNotFound)
      assert.equal(error.requestId, request.id)
    }
  })

  test('should return prompt content with text', async ({ assert }) => {
    const name = 'test-prompt-1'
    const prompt1Path = new URL(prompt1Module, import.meta.url).href
    const request = createPromptsGetRequest(name, { text: 'Hello World' })
    const context = createTestContext(request, {
      prompts: {
        [name]: prompt1Path,
      },
    }) as PromptContext
    const method = new GetPrompt()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.description)
    assert.equal(response.result?.description, 'First test prompt')
    assert.exists(response.result?.messages)
    assert.isArray(response.result?.messages)
    const messages = response.result?.messages as any[]
    assert.lengthOf(messages, 1)

    const message = messages[0]
    assert.exists(message)
    assert.equal(message?.role, 'user')
    assert.exists(message?.content)
    assert.equal(message?.content.type, 'text')
    assert.equal(message?.content.text, 'Hello from test prompt 1: Hello World')
  })

  test('should return prompt content without arguments', async ({ assert }) => {
    const name = 'test-prompt-2'
    const prompt2Path = new URL(prompt2Module, import.meta.url).href
    const request = createPromptsGetRequest(name)
    const context = createTestContext(request, {
      prompts: {
        [name]: prompt2Path,
      },
    }) as PromptContext
    const method = new GetPrompt()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.description)
    assert.equal(response.result?.description, 'Second test prompt')
    assert.exists(response.result?.messages)
    assert.isArray(response.result?.messages)
    const messages = response.result?.messages as any[]
    assert.lengthOf(messages, 1)

    const message = messages[0]
    assert.exists(message)
    assert.equal(message?.role, 'user')
    assert.exists(message?.content)
    assert.equal(message?.content.type, 'text')
    assert.equal(message?.content.text, 'Hello from test prompt 2: no number')
  })

  test('should return prompt content with number argument', async ({ assert }) => {
    const name = 'test-prompt-2'
    const prompt2Path = new URL(prompt2Module, import.meta.url).href
    const request = createPromptsGetRequest(name, { number: 42 })
    const context = createTestContext(request, {
      prompts: {
        [name]: prompt2Path,
      },
    }) as PromptContext
    const method = new GetPrompt()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.messages)
    const messages = response.result?.messages as any[]
    assert.lengthOf(messages, 1)

    const message = messages[0]
    assert.exists(message)
    assert.equal(message?.content.text, 'Hello from test prompt 2: 42')
  })

  test('should return prompt content with multiple messages', async ({ assert }) => {
    const name = 'test-prompt-multiple'
    const promptMultiplePath = new URL(promptMultipleModule, import.meta.url).href
    const request = createPromptsGetRequest(name)
    const context = createTestContext(request, {
      prompts: {
        [name]: promptMultiplePath,
      },
    }) as PromptContext
    const method = new GetPrompt()

    const response = await method.handle(context)

    assert.exists(response)
    assert.equal(response.jsonrpc, '2.0')
    assert.equal(response.id, request.id)
    assert.exists(response.result)
    assert.exists(response.result?.messages)
    const messages = response.result?.messages as any[]
    assert.lengthOf(messages, 2)

    const message1 = messages[0]
    assert.exists(message1)
    assert.equal(message1?.role, 'user')
    assert.equal(message1?.content.type, 'text')
    assert.equal(message1?.content.text, 'First message')

    const message2 = messages[1]
    assert.exists(message2)
    assert.equal(message2?.role, 'assistant')
    assert.equal(message2?.content.type, 'text')
    assert.equal(message2?.content.text, 'Second message')
  })
})
