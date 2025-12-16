/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import Text from '../../../../src/server/contents/text.js'
import Role from '../../../../src/enums/role.js'

// Mock tool and resource for testing
const mockTool = {} as any
const mockPrompt = {} as any
const mockResource = {
  uri: 'file:///test.txt',
  mimeType: 'text/plain',
} as any

test.group('Text Content', () => {
  test('should default to USER role', ({ assert }) => {
    const text = new Text('test')
    assert.equal(text.role, Role.USER)
  })

  test('should allow setting role to ASSISTANT', ({ assert }) => {
    const text = new Text('test')
    const result = text.asAssistant()
    assert.equal(text.role, Role.ASSISTANT)
    assert.strictEqual(result, text) // Should return this for chaining
  })

  test('should allow setting role to USER', ({ assert }) => {
    const text = new Text('test').asAssistant()
    const result = text.asUser()
    assert.equal(text.role, Role.USER)
    assert.strictEqual(result, text) // Should return this for chaining
  })
})

test.group('Text Content - toTool', () => {
  test('should convert to tool content without meta', async ({ assert }) => {
    const text = new Text('Hello World')
    const result = await text.toTool(mockTool)

    assert.deepEqual(result, {
      type: 'text',
      text: 'Hello World',
    })
  })

  test('should convert object to JSON string for tool', async ({ assert }) => {
    const text = new Text({ message: 'Hello', count: 42 })
    const result = await text.toTool(mockTool)

    assert.deepEqual(result, {
      type: 'text',
      text: '{"message":"Hello","count":42}',
    })
  })

  test('should include _meta when withMeta is used', async ({ assert }) => {
    const text = new Text('Hello World')
    text.withMeta({ source: 'test', timestamp: 123 })
    const result = await text.toTool(mockTool)

    assert.deepEqual(result, {
      type: 'text',
      text: 'Hello World',
      _meta: {
        source: 'test',
        timestamp: 123,
      },
    })
  })

  test('should allow chaining withMeta', async ({ assert }) => {
    const text = new Text('Hello World')
    const returnValue = text.withMeta({ key: 'value' })

    assert.strictEqual(returnValue, text)
  })

  test('should override meta when withMeta is called multiple times', async ({ assert }) => {
    const text = new Text('Hello World')
    text.withMeta({ first: 'meta' })
    text.withMeta({ second: 'meta' })
    const result = await text.toTool(mockTool)

    assert.deepEqual(result, {
      type: 'text',
      text: 'Hello World',
      _meta: {
        second: 'meta',
      },
    })
  })

  test('should handle complex meta objects', async ({ assert }) => {
    const text = new Text('Test')
    text.withMeta({
      nested: { deep: { value: 'test' } },
      array: [1, 2, 3],
      boolean: true,
      null: null,
    })
    const result = await text.toTool(mockTool)

    assert.property(result, '_meta')
    assert.deepEqual(result._meta, {
      nested: { deep: { value: 'test' } },
      array: [1, 2, 3],
      boolean: true,
      null: null,
    })
  })
})

test.group('Text Content - toPrompt', () => {
  test('should convert to prompt content without meta', async ({ assert }) => {
    const text = new Text('Hello Prompt')
    const result = await text.toPrompt(mockPrompt)

    assert.deepEqual(result, {
      type: 'text',
      text: 'Hello Prompt',
    })
  })

  test('should include _meta when withMeta is used for prompt', async ({ assert }) => {
    const text = new Text('Hello Prompt')
    text.withMeta({ promptId: 'test-123', priority: 'high' })
    const result = await text.toPrompt(mockPrompt)

    assert.deepEqual(result, {
      type: 'text',
      text: 'Hello Prompt',
      _meta: {
        promptId: 'test-123',
        priority: 'high',
      },
    })
  })

  test('should work with role and meta together', async ({ assert }) => {
    const text = new Text('Hello')
    text.asAssistant().withMeta({ role: 'assistant' })
    const result = await text.toPrompt(mockPrompt)

    assert.equal(text.role, Role.ASSISTANT)
    assert.property(result, '_meta')
  })
})

test.group('Text Content - toResource', () => {
  test('should convert to resource content without meta', async ({ assert }) => {
    const text = new Text('Resource content')
    const result = await text.toResource(mockResource)

    assert.deepEqual(result, {
      text: 'Resource content',
      uri: 'file:///test.txt',
      mimeType: 'text/plain',
    })
  })

  test('should include _meta when withMeta is used for resource', async ({ assert }) => {
    const text = new Text('Resource content')
    text.withMeta({ version: '1.0', author: 'test' })
    const result = await text.toResource(mockResource)

    assert.deepEqual(result, {
      text: 'Resource content',
      uri: 'file:///test.txt',
      mimeType: 'text/plain',
      _meta: {
        version: '1.0',
        author: 'test',
      },
    })
  })

  test('should include resource properties in output', async ({ assert }) => {
    const customResource = {
      uri: 'file:///custom/path.json',
      mimeType: 'application/json',
    } as any

    const text = new Text('{"test": true}')
    const result = await text.toResource(customResource)

    assert.equal(result.uri, 'file:///custom/path.json')
    assert.equal(result.mimeType, 'application/json')
  })
})

test.group('Text Content - withMeta edge cases', () => {
  test('should handle empty meta object', async ({ assert }) => {
    const text = new Text('Test')
    text.withMeta({})
    const result = await text.toTool(mockTool)

    assert.deepEqual(result, {
      type: 'text',
      text: 'Test',
      _meta: {},
    })
  })

  test('should preserve meta across multiple conversions', async ({ assert }) => {
    const text = new Text('Multi-use')
    text.withMeta({ shared: 'meta' })

    const toolResult = await text.toTool(mockTool)
    const promptResult = await text.toPrompt(mockPrompt)
    const resourceResult = await text.toResource(mockResource)

    assert.property(toolResult, '_meta')
    assert.property(promptResult, '_meta')
    assert.property(resourceResult, '_meta')
    assert.deepEqual(toolResult._meta, { shared: 'meta' })
    assert.deepEqual(promptResult._meta, { shared: 'meta' })
    assert.deepEqual(resourceResult._meta, { shared: 'meta' })
  })

  test('should work without calling withMeta', async ({ assert }) => {
    const text = new Text('No meta')
    const toolResult = await text.toTool(mockTool)
    const promptResult = await text.toPrompt(mockPrompt)
    const resourceResult = await text.toResource(mockResource)

    assert.notProperty(toolResult, '_meta')
    assert.notProperty(promptResult, '_meta')
    assert.notProperty(resourceResult, '_meta')
  })
})
