/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import Image from '../../../../src/server/contents/image.js'
import Role from '../../../../src/enums/role.js'

const mockTool = {} as any
const mockPrompt = {} as any
const mockResource = {} as any

test.group('Image Content', () => {
  test('should create image content with data and mimeType', ({ assert }) => {
    const image = new Image('base64data', 'image/png')
    assert.exists(image)
  })

  test('should default to USER role', ({ assert }) => {
    const image = new Image('data', 'image/jpeg')
    assert.equal(image.role, Role.USER)
  })

  test('should allow setting role to ASSISTANT', ({ assert }) => {
    const image = new Image('data', 'image/png')
    const result = image.asAssistant()
    assert.equal(image.role, Role.ASSISTANT)
    assert.strictEqual(result, image)
  })

  test('should allow setting role to USER', ({ assert }) => {
    const image = new Image('data', 'image/png').asAssistant()
    const result = image.asUser()
    assert.equal(image.role, Role.USER)
    assert.strictEqual(result, image)
  })
})

test.group('Image Content - Unsupported operations', () => {
  test('should throw error when converting to resource', async ({ assert }) => {
    const image = new Image('data', 'image/png')

    try {
      await image.toResource(mockResource)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'Image content may not be used in resources')
      assert.equal(error.code, 'E_IMAGE_NOT_SUPPORTED')
    }
  })
})

test.group('Image Content - toTool', () => {
  test('should convert to tool content without meta', async ({ assert }) => {
    const image = new Image('iVBORw0KGgo=', 'image/png')
    const result = await image.toTool(mockTool)

    assert.deepEqual(result, {
      type: 'image',
      data: 'iVBORw0KGgo=',
      mimeType: 'image/png',
    })
  })

  test('should include _meta when withMeta is used', async ({ assert }) => {
    const image = new Image('imagedata', 'image/jpeg')
    image.withMeta({ width: 800, height: 600, source: 'camera' })
    const result = await image.toTool(mockTool)

    assert.deepEqual(result, {
      type: 'image',
      data: 'imagedata',
      mimeType: 'image/jpeg',
      _meta: {
        width: 800,
        height: 600,
        source: 'camera',
      },
    })
  })

  test('should allow chaining withMeta', ({ assert }) => {
    const image = new Image('data', 'image/png')
    const returnValue = image.withMeta({ key: 'value' })

    assert.strictEqual(returnValue, image)
  })

  test('should handle different image mime types', async ({ assert }) => {
    const formats = [
      { data: 'data1', mimeType: 'image/png' },
      { data: 'data2', mimeType: 'image/jpeg' },
      { data: 'data3', mimeType: 'image/gif' },
      { data: 'data4', mimeType: 'image/webp' },
      { data: 'data5', mimeType: 'image/svg+xml' },
    ]

    for (const format of formats) {
      const image = new Image(format.data, format.mimeType)
      const result = await image.toTool(mockTool)

      assert.equal(result.mimeType, format.mimeType)
      assert.equal(result.data, format.data)
    }
  })

  test('should override meta when withMeta is called multiple times', async ({ assert }) => {
    const image = new Image('data', 'image/png')
    image.withMeta({ first: 'meta' })
    image.withMeta({ second: 'meta' })
    const result = await image.toTool(mockTool)

    assert.deepEqual(result, {
      type: 'image',
      data: 'data',
      mimeType: 'image/png',
      _meta: {
        second: 'meta',
      },
    })
  })
})

test.group('Image Content - toPrompt', () => {
  test('should convert to prompt content without meta', async ({ assert }) => {
    const image = new Image('promptImageData', 'image/png')
    const result = await image.toPrompt(mockPrompt)

    assert.deepEqual(result, {
      type: 'image',
      data: 'promptImageData',
      mimeType: 'image/png',
    })
  })

  test('should include _meta when withMeta is used for prompt', async ({ assert }) => {
    const image = new Image('promptData', 'image/jpeg')
    image.withMeta({ promptContext: 'user-upload', timestamp: Date.now() })
    const result = await image.toPrompt(mockPrompt)

    assert.property(result, '_meta')
    assert.equal(result.type, 'image')
    assert.equal(result.data, 'promptData')
    assert.equal(result.mimeType, 'image/jpeg')
    assert.property(result._meta, 'promptContext')
    assert.property(result._meta, 'timestamp')
  })

  test('should work with role and meta together', async ({ assert }) => {
    const image = new Image('data', 'image/png')
    image.asAssistant().withMeta({ generated: true })
    const result = await image.toPrompt(mockPrompt)

    assert.equal(image.role, Role.ASSISTANT)
    assert.property(result, '_meta')
    assert.equal(result._meta?.generated, true)
  })
})

test.group('Image Content - withMeta edge cases', () => {
  test('should handle empty meta object', async ({ assert }) => {
    const image = new Image('data', 'image/png')
    image.withMeta({})
    const result = await image.toTool(mockTool)

    assert.deepEqual(result._meta, {})
  })

  test('should preserve meta across multiple conversions', async ({ assert }) => {
    const image = new Image('multi-use', 'image/png')
    image.withMeta({ shared: 'meta', id: 123 })

    const toolResult = await image.toTool(mockTool)
    const promptResult = await image.toPrompt(mockPrompt)

    assert.property(toolResult, '_meta')
    assert.property(promptResult, '_meta')
    assert.deepEqual(toolResult._meta, { shared: 'meta', id: 123 })
    assert.deepEqual(promptResult._meta, { shared: 'meta', id: 123 })
  })

  test('should work without calling withMeta', async ({ assert }) => {
    const image = new Image('no-meta', 'image/png')
    const toolResult = await image.toTool(mockTool)
    const promptResult = await image.toPrompt(mockPrompt)

    assert.notProperty(toolResult, '_meta')
    assert.notProperty(promptResult, '_meta')
  })

  test('should handle complex meta objects', async ({ assert }) => {
    const image = new Image('data', 'image/png')
    image.withMeta({
      dimensions: { width: 1920, height: 1080 },
      metadata: {
        camera: 'Canon EOS',
        settings: { iso: 400, aperture: 'f/2.8' },
      },
      tags: ['landscape', 'nature'],
      location: null,
    })
    const result = await image.toTool(mockTool)

    assert.property(result, '_meta')
    assert.deepEqual(result._meta, {
      dimensions: { width: 1920, height: 1080 },
      metadata: {
        camera: 'Canon EOS',
        settings: { iso: 400, aperture: 'f/2.8' },
      },
      tags: ['landscape', 'nature'],
      location: null,
    })
  })

  test('should handle meta with special characters in values', async ({ assert }) => {
    const image = new Image('data', 'image/png')
    image.withMeta({
      description: 'Image with "quotes" and \'apostrophes\'',
      path: '/path/to/file.png',
      emoji: '🖼️📷',
    })
    const result = await image.toTool(mockTool)

    assert.property(result, '_meta')
    assert.include(result._meta?.description as string, 'quotes')
    assert.include(result._meta?.emoji as string, '🖼️')
  })
})

test.group('Image Content - Role and chaining', () => {
  test('should allow chaining role and meta', async ({ assert }) => {
    const image = new Image('data', 'image/png')
    const result = image.asAssistant().withMeta({ ai_generated: true })

    assert.strictEqual(result, image)
    assert.equal(image.role, Role.ASSISTANT)

    const output = await image.toTool(mockTool)
    assert.property(output, '_meta')
  })

  test('should allow chaining meta and role', async ({ assert }) => {
    const image = new Image('data', 'image/png')
    const result = image.withMeta({ source: 'upload' }).asUser()

    assert.strictEqual(result, image)
    assert.equal(image.role, Role.USER)

    const output = await image.toTool(mockTool)
    assert.property(output, '_meta')
  })
})
