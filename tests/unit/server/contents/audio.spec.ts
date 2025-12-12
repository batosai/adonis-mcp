/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import Audio from '../../../../src/server/contents/audio.js'
import Role from '../../../../src/enums/role.js'

const mockTool = {} as any
const mockPrompt = {} as any
const mockResource = {} as any

test.group('Audio Content', () => {
  test('should create audio content with data and mimeType', ({ assert }) => {
    const audio = new Audio('base64audiodata', 'audio/mp3')
    assert.exists(audio)
  })

  test('should default to USER role', ({ assert }) => {
    const audio = new Audio('data', 'audio/wav')
    assert.equal(audio.role, Role.USER)
  })

  test('should allow setting role to ASSISTANT', ({ assert }) => {
    const audio = new Audio('data', 'audio/mp3')
    const result = audio.asAssistant()
    assert.equal(audio.role, Role.ASSISTANT)
    assert.strictEqual(result, audio)
  })

  test('should allow setting role to USER', ({ assert }) => {
    const audio = new Audio('data', 'audio/mp3').asAssistant()
    const result = audio.asUser()
    assert.equal(audio.role, Role.USER)
    assert.strictEqual(result, audio)
  })
})

test.group('Audio Content - Unsupported operations', () => {
  test('should throw error when converting to resource', async ({ assert }) => {
    const audio = new Audio('data', 'audio/mp3')

    try {
      await audio.toResource(mockResource)
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'Audio content may not be used in resources')
      assert.equal(error.code, 'E_AUDIO_NOT_SUPPORTED')
    }
  })
})

test.group('Audio Content - toTool', () => {
  test('should convert to tool content without meta', async ({ assert }) => {
    const audio = new Audio('audioBase64Data', 'audio/mp3')
    const result = await audio.toTool(mockTool)

    assert.deepEqual(result, {
      type: 'audio',
      data: 'audioBase64Data',
      mimeType: 'audio/mp3',
    })
  })

  test('should include _meta when withMeta is used', async ({ assert }) => {
    const audio = new Audio('audiodata', 'audio/wav')
    audio.withMeta({ duration: 120, bitrate: 320, artist: 'Test Artist' })
    const result = await audio.toTool(mockTool)

    assert.deepEqual(result, {
      type: 'audio',
      data: 'audiodata',
      mimeType: 'audio/wav',
      _meta: {
        duration: 120,
        bitrate: 320,
        artist: 'Test Artist',
      },
    })
  })

  test('should allow chaining withMeta', ({ assert }) => {
    const audio = new Audio('data', 'audio/mp3')
    const returnValue = audio.withMeta({ key: 'value' })

    assert.strictEqual(returnValue, audio)
  })

  test('should handle different audio mime types', async ({ assert }) => {
    const formats = [
      { data: 'data1', mimeType: 'audio/mp3' },
      { data: 'data2', mimeType: 'audio/wav' },
      { data: 'data3', mimeType: 'audio/ogg' },
      { data: 'data4', mimeType: 'audio/aac' },
      { data: 'data5', mimeType: 'audio/flac' },
      { data: 'data6', mimeType: 'audio/mpeg' },
    ]

    for (const format of formats) {
      const audio = new Audio(format.data, format.mimeType)
      const result = await audio.toTool(mockTool)

      assert.equal(result.mimeType, format.mimeType)
      assert.equal(result.data, format.data)
    }
  })

  test('should override meta when withMeta is called multiple times', async ({ assert }) => {
    const audio = new Audio('data', 'audio/mp3')
    audio.withMeta({ first: 'meta' })
    audio.withMeta({ second: 'meta' })
    const result = await audio.toTool(mockTool)

    assert.deepEqual(result, {
      type: 'audio',
      data: 'data',
      mimeType: 'audio/mp3',
      _meta: {
        second: 'meta',
      },
    })
  })
})

test.group('Audio Content - toPrompt', () => {
  test('should convert to prompt content without meta', async ({ assert }) => {
    const audio = new Audio('promptAudioData', 'audio/mp3')
    const result = await audio.toPrompt(mockPrompt)

    assert.deepEqual(result, {
      type: 'audio',
      data: 'promptAudioData',
      mimeType: 'audio/mp3',
    })
  })

  test('should include _meta when withMeta is used for prompt', async ({ assert }) => {
    const audio = new Audio('promptData', 'audio/wav')
    audio.withMeta({ transcription: 'Hello world', language: 'en-US' })
    const result = await audio.toPrompt(mockPrompt)

    assert.property(result, '_meta')
    assert.equal(result.type, 'audio')
    assert.equal(result.data, 'promptData')
    assert.equal(result.mimeType, 'audio/wav')
    assert.equal(result._meta?.transcription, 'Hello world')
    assert.equal(result._meta?.language, 'en-US')
  })

  test('should work with role and meta together', async ({ assert }) => {
    const audio = new Audio('data', 'audio/mp3')
    audio.asAssistant().withMeta({ synthesized: true })
    const result = await audio.toPrompt(mockPrompt)

    assert.equal(audio.role, Role.ASSISTANT)
    assert.property(result, '_meta')
    assert.equal(result._meta?.synthesized, true)
  })
})

test.group('Audio Content - withMeta edge cases', () => {
  test('should handle empty meta object', async ({ assert }) => {
    const audio = new Audio('data', 'audio/mp3')
    audio.withMeta({})
    const result = await audio.toTool(mockTool)

    assert.deepEqual(result._meta, {})
  })

  test('should preserve meta across multiple conversions', async ({ assert }) => {
    const audio = new Audio('multi-use', 'audio/mp3')
    audio.withMeta({ shared: 'meta', track: 5 })

    const toolResult = await audio.toTool(mockTool)
    const promptResult = await audio.toPrompt(mockPrompt)

    assert.property(toolResult, '_meta')
    assert.property(promptResult, '_meta')
    assert.deepEqual(toolResult._meta, { shared: 'meta', track: 5 })
    assert.deepEqual(promptResult._meta, { shared: 'meta', track: 5 })
  })

  test('should work without calling withMeta', async ({ assert }) => {
    const audio = new Audio('no-meta', 'audio/mp3')
    const toolResult = await audio.toTool(mockTool)
    const promptResult = await audio.toPrompt(mockPrompt)

    assert.notProperty(toolResult, '_meta')
    assert.notProperty(promptResult, '_meta')
  })

  test('should handle complex meta objects', async ({ assert }) => {
    const audio = new Audio('data', 'audio/mp3')
    audio.withMeta({
      metadata: {
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        year: 2024,
      },
      technical: {
        sampleRate: 44100,
        channels: 2,
        bitrate: 320,
      },
      tags: ['music', 'test'],
      lyrics: null,
    })
    const result = await audio.toTool(mockTool)

    assert.property(result, '_meta')
    assert.deepEqual(result._meta, {
      metadata: {
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        year: 2024,
      },
      technical: {
        sampleRate: 44100,
        channels: 2,
        bitrate: 320,
      },
      tags: ['music', 'test'],
      lyrics: null,
    })
  })

  test('should handle meta with audio-specific information', async ({ assert }) => {
    const audio = new Audio('data', 'audio/mp3')
    audio.withMeta({
      duration: 180.5,
      waveform: [0.1, 0.5, 0.8, 0.3],
      peaks: { max: 0.95, min: -0.92 },
      format: { codec: 'MP3', container: 'MPEG' },
    })
    const result = await audio.toTool(mockTool)

    assert.property(result, '_meta')
    assert.equal(result._meta?.duration, 180.5)
    assert.isArray(result._meta?.waveform)
    assert.property(result._meta?.peaks, 'max')
  })
})

test.group('Audio Content - Role and chaining', () => {
  test('should allow chaining role and meta', async ({ assert }) => {
    const audio = new Audio('data', 'audio/mp3')
    const result = audio.asAssistant().withMeta({ tts_generated: true })

    assert.strictEqual(result, audio)
    assert.equal(audio.role, Role.ASSISTANT)

    const output = await audio.toTool(mockTool)
    assert.property(output, '_meta')
  })

  test('should allow chaining meta and role', async ({ assert }) => {
    const audio = new Audio('data', 'audio/mp3')
    const result = audio.withMeta({ source: 'microphone' }).asUser()

    assert.strictEqual(result, audio)
    assert.equal(audio.role, Role.USER)

    const output = await audio.toTool(mockTool)
    assert.property(output, '_meta')
  })

  test('should support complex chaining', async ({ assert }) => {
    const audio = new Audio('data', 'audio/wav')
    const result = audio.asUser().withMeta({ quality: 'high' }).asAssistant().withMeta({ processed: true })

    assert.equal(audio.role, Role.ASSISTANT)
    const output = await audio.toTool(mockTool)
    // Last withMeta should override
    assert.deepEqual(output._meta, { processed: true })
  })
})
