/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import Blob from '../../../../src/server/contents/blob.js'

const mockTool = {} as any
const mockPrompt = {} as any
const mockResource = {
  uri: 'file:///test.bin',
  mimeType: 'application/octet-stream',
} as any

test.group('Blob Content', () => {

  test('should encode string to base64', async ({ assert }) => {
    const blob = new Blob('Hello World')
    const result = await blob.toResource(mockResource)

    // "Hello World" in base64 is "SGVsbG8gV29ybGQ="
    assert.equal(result.blob, 'SGVsbG8gV29ybGQ=')
  })

  test('should encode Buffer to base64', async ({ assert }) => {
    const buffer = Buffer.from('Test Data')
    const blob = new Blob(buffer)
    const result = await blob.toResource(mockResource)

    // "Test Data" in base64 is "VGVzdCBEYXRh"
    assert.equal(result.blob, 'VGVzdCBEYXRh')
  })
})

test.group('Blob Content - Unsupported operations', () => {
  test('should throw error when converting to tool', async ({ assert }) => {
    const blob = new Blob('test')

    try {
      await blob.toTool(mockTool)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'Blob content may not be used in tools')
      assert.equal(error.code, 'E_BLOB_NOT_SUPPORTED')
    }
  })

  test('should throw error when converting to prompt', async ({ assert }) => {
    const blob = new Blob('test')

    try {
      await blob.toPrompt(mockPrompt)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'Blob content may not be used in prompts')
      assert.equal(error.code, 'E_BLOB_NOT_SUPPORTED')
    }
  })
})

test.group('Blob Content - toResource', () => {
  test('should convert to resource content without meta', async ({ assert }) => {
    const blob = new Blob('Binary data')
    const result = await blob.toResource(mockResource)

    assert.property(result, 'blob')
    assert.equal(result.uri, 'file:///test.bin')
    assert.equal(result.mimeType, 'application/octet-stream')
    assert.notProperty(result, '_meta')
  })

  test('should include _meta when withMeta is used', async ({ assert }) => {
    const blob = new Blob('Binary data')
    blob.withMeta({ checksum: 'abc123', size: 1024 })
    const result = await blob.toResource(mockResource)

    assert.deepEqual(result, {
      blob: Buffer.from('Binary data').toString('base64'),
      uri: 'file:///test.bin',
      mimeType: 'application/octet-stream',
      _meta: {
        checksum: 'abc123',
        size: 1024,
      },
    })
  })

  test('should allow chaining withMeta', ({ assert }) => {
    const blob = new Blob('test')
    const returnValue = blob.withMeta({ key: 'value' })

    assert.strictEqual(returnValue, blob)
  })

  test('should override meta when withMeta is called multiple times', async ({ assert }) => {
    const blob = new Blob('test')
    blob.withMeta({ first: 'meta' })
    blob.withMeta({ second: 'meta' })
    const result = await blob.toResource(mockResource)

    assert.property(result, '_meta')
    assert.deepEqual(result._meta, {
      second: 'meta',
    })
  })

  test('should handle complex meta objects', async ({ assert }) => {
    const blob = new Blob('data')
    blob.withMeta({
      metadata: {
        encoding: 'base64',
        original: { format: 'binary', size: 100 },
      },
      tags: ['important', 'archive'],
    })
    const result = await blob.toResource(mockResource)

    assert.property(result, '_meta')
    assert.deepEqual(result._meta, {
      metadata: {
        encoding: 'base64',
        original: { format: 'binary', size: 100 },
      },
      tags: ['important', 'archive'],
    })
  })
})

test.group('Blob Content - withMeta edge cases', () => {
  test('should handle empty meta object', async ({ assert }) => {
    const blob = new Blob('test')
    blob.withMeta({})
    const result = await blob.toResource(mockResource)

    assert.deepEqual(result._meta, {})
  })

  test('should preserve meta across multiple conversions', async ({ assert }) => {
    const blob = new Blob('Multi-use')
    blob.withMeta({ shared: 'meta' })

    const result1 = await blob.toResource(mockResource)
    const result2 = await blob.toResource(mockResource)

    assert.property(result1, '_meta')
    assert.property(result2, '_meta')
    assert.deepEqual(result1._meta, { shared: 'meta' })
    assert.deepEqual(result2._meta, { shared: 'meta' })
  })

  test('should work without calling withMeta', async ({ assert }) => {
    const blob = new Blob('No meta')
    const result = await blob.toResource(mockResource)

    assert.notProperty(result, '_meta')
  })

  test('should include resource properties with different URIs', async ({ assert }) => {
    const customResource = {
      uri: 'file:///custom/data.dat',
      mimeType: 'application/x-custom',
    } as any

    const blob = new Blob('Custom data')
    blob.withMeta({ custom: true })
    const result = await blob.toResource(customResource)

    assert.equal(result.uri, 'file:///custom/data.dat')
    assert.equal(result.mimeType, 'application/x-custom')
    assert.property(result, '_meta')
  })
})

test.group('Blob Content - Binary data handling', () => {
  test('should correctly encode empty string', async ({ assert }) => {
    const blob = new Blob('')
    const result = await blob.toResource(mockResource)

    assert.equal(result.blob, '')
  })

  test('should handle special characters', async ({ assert }) => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const blob = new Blob(specialChars)
    const result = await blob.toResource(mockResource)

    // Verify it's base64 encoded
    const decoded = Buffer.from(result.blob, 'base64').toString('utf-8')
    assert.equal(decoded, specialChars)
  })

  test('should handle unicode characters', async ({ assert }) => {
    const unicode = '🚀 Hello 世界 🎉'
    const blob = new Blob(unicode)
    const result = await blob.toResource(mockResource)

    // Verify it's base64 encoded
    const decoded = Buffer.from(result.blob, 'base64').toString('utf-8')
    assert.equal(decoded, unicode)
  })

  test('should handle binary Buffer data', async ({ assert }) => {
    const buffer = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe])
    const blob = new Blob(buffer)
    const result = await blob.toResource(mockResource)

    // Verify the base64 encoding
    const decoded = Buffer.from(result.blob, 'base64')
    assert.deepEqual(Array.from(decoded), [0x00, 0x01, 0x02, 0xff, 0xfe])
  })
})
