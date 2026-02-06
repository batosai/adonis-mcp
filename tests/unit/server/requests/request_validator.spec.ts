/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ToolContext, ResourceContext, PromptContext } from '../../../../src/types/context.js'
import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import { RequestValidator } from '../../../../src/server/requests/request_validator.js'
import { createTestContext } from '../../../helpers/create_context.js'
import {
  createToolsCallRequest,
  createResourcesReadRequest,
  createPromptsGetRequest,
} from '../../../helpers/create_request.js'
import JsonRpcException from '../../../../src/server/exceptions/jsonrpc_exception.js'
import { ErrorCode } from '../../../../src/enums/error.js'

test.group('RequestValidator.validateUsing', () => {
  test('should validate tool context arguments with valid data', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        name: vine.string(),
        age: vine.number(),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      name: 'John',
      age: 30,
    })

    const context = createTestContext(request) as ToolContext
    ;(context as any).args = request.params?.arguments ?? {}
    const requestValidator = new RequestValidator(context)

    const result = await requestValidator.validateUsing(validator)

    assert.equal(result.name, 'John')
    assert.equal(result.age, 30)
  })

  test('should validate prompt context arguments with valid data', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        query: vine.string(),
      })
    )

    const request = createPromptsGetRequest('test-prompt', {
      query: 'search term',
    })

    const context = createTestContext(request) as PromptContext
    ;(context as any).args = request.params?.arguments ?? {}
    const requestValidator = new RequestValidator(context)

    const result = await requestValidator.validateUsing(validator)

    assert.equal(result.query, 'search term')
  })

  test('should validate resource context arguments with valid data', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        uri: vine.string(),
      })
    )

    const request = createResourcesReadRequest('file://example.txt')

    const context = createTestContext(request) as ResourceContext
    ;(context as any).args = { uri: request.params?.uri ?? '' }
    const requestValidator = new RequestValidator(context)

    const result = await requestValidator.validateUsing(validator)

    assert.equal(result.uri, 'file://example.txt')
  })

  test('should throw validation error for invalid tool arguments', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        name: vine.string(),
        age: vine.number(),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      name: 'John',
      age: 'invalid-number',
    })

    const context = createTestContext(request) as ToolContext
    const requestValidator = new RequestValidator(context)

    try {
      await requestValidator.validateUsing(validator)
      assert.fail('Should have thrown a validation error')
    } catch (error: any) {
      assert.exists(error)
    }
  })

  test('should throw JsonRpcException for invalid prompt arguments', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        query: vine.string().minLength(3),
      })
    )

    const request = createPromptsGetRequest('test-prompt', {
      query: 'ab',
    })

    const context = createTestContext(request) as PromptContext
    const requestValidator = new RequestValidator(context)

    try {
      await requestValidator.validateUsing(validator)
      assert.fail('Should have thrown a JsonRpcException')
    } catch (error: any) {
      assert.instanceOf(error, JsonRpcException)
      assert.equal(error.code, ErrorCode.InvalidParams)
    }
  })

  test('should use custom data from options over context args', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        message: vine.string(),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      message: 'original',
    })

    const context = createTestContext(request) as ToolContext
    const requestValidator = new RequestValidator(context)

    const customData = { message: 'custom' }
    const result = await requestValidator.validateUsing(validator, {
      data: customData,
    })

    assert.equal(result.message, 'custom')
  })

  test('should validate with optional fields', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        name: vine.string(),
        description: vine.string().optional(),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      name: 'John',
    })

    const context = createTestContext(request) as ToolContext
    ;(context as any).args = request.params?.arguments ?? {}
    const requestValidator = new RequestValidator(context)

    const result = await requestValidator.validateUsing(validator)

    assert.equal(result.name, 'John')
    assert.isUndefined(result.description)
  })

  test('should validate with complex nested objects', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        user: vine.object({
          name: vine.string(),
          email: vine.string().email(),
        }),
        settings: vine.object({
          theme: vine.enum(['light', 'dark']),
        }),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      settings: {
        theme: 'dark',
      },
    })

    const context = createTestContext(request) as ToolContext
    ;(context as any).args = request.params?.arguments ?? {}
    const requestValidator = new RequestValidator(context)

    const result = await requestValidator.validateUsing(validator)

    assert.equal(result.user.name, 'John Doe')
    assert.equal(result.user.email, 'john@example.com')
    assert.equal(result.settings.theme, 'dark')
  })

  test('should validate with arrays', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        tags: vine.array(vine.string()),
        ids: vine.array(vine.number()),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      tags: ['javascript', 'typescript'],
      ids: [1, 2, 3],
    })

    const context = createTestContext(request) as ToolContext
    ;(context as any).args = request.params?.arguments ?? {}
    const requestValidator = new RequestValidator(context)

    const result = await requestValidator.validateUsing(validator)

    assert.deepEqual(result.tags, ['javascript', 'typescript'])
    assert.deepEqual(result.ids, [1, 2, 3])
  })

  test('should throw error when required field is missing', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        name: vine.string(),
        email: vine.string(),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      name: 'John',
    })

    const context = createTestContext(request) as ToolContext
    const requestValidator = new RequestValidator(context)

    try {
      await requestValidator.validateUsing(validator)
      assert.fail('Should have thrown a validation error')
    } catch (error: any) {
      assert.exists(error)
    }
  })

  test('should validate with custom validation rules', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        password: vine.string().minLength(8),
        confirmPassword: vine.string(),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      password: 'weak',
      confirmPassword: 'weak',
    })

    const context = createTestContext(request) as ToolContext
    const requestValidator = new RequestValidator(context)

    try {
      await requestValidator.validateUsing(validator)
      assert.fail('Should have thrown a validation error')
    } catch (error: any) {
      assert.exists(error)
    }
  })

  test('should handle null and undefined values appropriately', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        name: vine.string(),
        nickname: vine.string().nullable(),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      name: 'John',
      nickname: null,
    })

    const context = createTestContext(request) as ToolContext
    ;(context as any).args = request.params?.arguments ?? {}
    const requestValidator = new RequestValidator(context)

    const result = await requestValidator.validateUsing(validator)

    assert.equal(result.name, 'John')
    assert.isNull(result.nickname)
  })

  test('should validate multiple error messages in tool context', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        name: vine.string().minLength(3),
        age: vine.number().min(0),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      name: 'ab',
      age: -5,
    })

    const context = createTestContext(request) as ToolContext
    const requestValidator = new RequestValidator(context)

    try {
      await requestValidator.validateUsing(validator)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.exists(error)
    }
  })

  test('should validate with transform rules', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        email: vine.string().email().toLowerCase(),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      email: 'JOHN@EXAMPLE.COM',
    })

    const context = createTestContext(request) as ToolContext
    ;(context as any).args = request.params?.arguments ?? {}
    const requestValidator = new RequestValidator(context)

    const result = await requestValidator.validateUsing(validator)

    assert.equal(result.email, 'john@example.com')
  })

  test('should return validated data in correct format', async ({ assert }) => {
    const validator = vine.compile(
      vine.object({
        id: vine.number(),
        status: vine.enum(['active', 'inactive']),
        metadata: vine.object({
          createdAt: vine.string(),
        }),
      })
    )

    const request = createToolsCallRequest('test-tool', {
      id: 123,
      status: 'active',
      metadata: {
        createdAt: '2024-01-01',
      },
    })

    const context = createTestContext(request) as ToolContext
    ;(context as any).args = request.params?.arguments ?? {}
    const requestValidator = new RequestValidator(context)

    const result = await requestValidator.validateUsing(validator)

    assert.equal(result.id, 123)
    assert.equal(result.status, 'active')
    assert.equal(result.metadata.createdAt, '2024-01-01')
  })
})
