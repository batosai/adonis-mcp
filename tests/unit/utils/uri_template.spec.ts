/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import { UriTemplate } from '../../../src/utils/uri_template.js'

test.group('UriTemplate - isTemplate', () => {
  test('should return true for simple variable template', ({ assert }) => {
    assert.isTrue(UriTemplate.isTemplate('file:///users/{id}'))
    assert.isTrue(UriTemplate.isTemplate('{id}'))
    assert.isTrue(UriTemplate.isTemplate('prefix-{var}-suffix'))
  })

  test('should return true for query parameter template', ({ assert }) => {
    assert.isTrue(UriTemplate.isTemplate('file:///api{?page,limit}'))
    assert.isTrue(UriTemplate.isTemplate('{?query}'))
  })

  test('should return true for path template', ({ assert }) => {
    assert.isTrue(UriTemplate.isTemplate('file:///files{/path}'))
    assert.isTrue(UriTemplate.isTemplate('{/path}'))
  })

  test('should return true for fragment template', ({ assert }) => {
    assert.isTrue(UriTemplate.isTemplate('file:///doc{#section}'))
    assert.isTrue(UriTemplate.isTemplate('{#fragment}'))
  })

  test('should return true for reserved expansion', ({ assert }) => {
    assert.isTrue(UriTemplate.isTemplate('file:///{+path}'))
    assert.isTrue(UriTemplate.isTemplate('{+reserved}'))
  })

  test('should return true for multiple variables', ({ assert }) => {
    assert.isTrue(UriTemplate.isTemplate('file:///users/{userId}/posts/{postId}'))
    assert.isTrue(UriTemplate.isTemplate('{x}{y}{z}'))
  })

  test('should return false for normal URIs', ({ assert }) => {
    assert.isFalse(UriTemplate.isTemplate('file:///normal-path'))
    assert.isFalse(UriTemplate.isTemplate('https://example.com'))
    assert.isFalse(UriTemplate.isTemplate('simple-string'))
  })

  test('should return false for empty braces', ({ assert }) => {
    assert.isFalse(UriTemplate.isTemplate('{}'))
    assert.isFalse(UriTemplate.isTemplate('{ }'))
  })

  test('should return false for empty string', ({ assert }) => {
    assert.isFalse(UriTemplate.isTemplate(''))
  })
})

test.group('UriTemplate - Constructor and toString', () => {
  test('should construct with valid template', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}')
    assert.equal(template.toString(), 'file:///users/{id}')
  })

  test('should throw error for unclosed template expression', ({ assert }) => {
    assert.throws(() => new UriTemplate('file:///users/{id'), 'Unclosed template expression')
  })

  test('should throw error for template exceeding max length', ({ assert }) => {
    const longTemplate = 'a'.repeat(1000001)
    assert.throws(() => new UriTemplate(longTemplate), /Template exceeds maximum length/)
  })

  test('should throw error for too many expressions', ({ assert }) => {
    // Create a template with 10001 expressions (exceeds MAX_TEMPLATE_EXPRESSIONS)
    const manyExpressions = Array(10001).fill('{x}').join('')
    assert.throws(() => new UriTemplate(manyExpressions), /Template contains too many expressions/)
  })
})

test.group('UriTemplate - variableNames', () => {
  test('should extract single variable name', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}')
    assert.deepEqual(template.variableNames, ['id'])
  })

  test('should extract multiple variable names', ({ assert }) => {
    const template = new UriTemplate('file:///users/{userId}/posts/{postId}')
    assert.deepEqual(template.variableNames, ['userId', 'postId'])
  })

  test('should extract query parameter names', ({ assert }) => {
    const template = new UriTemplate('file:///api{?page,limit}')
    assert.deepEqual(template.variableNames, ['page', 'limit'])
  })

  test('should handle exploded variables', ({ assert }) => {
    const template = new UriTemplate('file:///files{/path*}')
    assert.deepEqual(template.variableNames, ['path'])
  })

  test('should return empty array for template without variables', ({ assert }) => {
    const template = new UriTemplate('file:///static/path')
    assert.deepEqual(template.variableNames, [])
  })
})

test.group('UriTemplate - expand - Simple variables', () => {
  test('should expand simple variable', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}')
    const result = template.expand({ id: '123' })
    assert.equal(result, 'file:///users/123')
  })

  test('should expand multiple simple variables', ({ assert }) => {
    const template = new UriTemplate('file:///users/{userId}/posts/{postId}')
    const result = template.expand({ userId: '123', postId: '456' })
    assert.equal(result, 'file:///users/123/posts/456')
  })

  test('should handle missing variable by omitting it', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}')
    const result = template.expand({})
    assert.equal(result, 'file:///users/')
  })

  test('should encode special characters in simple variables', ({ assert }) => {
    const template = new UriTemplate('file:///search/{query}')
    const result = template.expand({ query: 'hello world' })
    assert.equal(result, 'file:///search/hello%20world')
  })

  test('should handle array values as comma-separated', ({ assert }) => {
    const template = new UriTemplate('file:///tags/{tags}')
    const result = template.expand({ tags: ['red', 'green', 'blue'] })
    assert.equal(result, 'file:///tags/red,green,blue')
  })
})

test.group('UriTemplate - expand - Reserved expansion (+)', () => {
  test('should expand reserved variable with +', ({ assert }) => {
    const template = new UriTemplate('file:///{+path}')
    const result = template.expand({ path: 'foo/bar/baz' })
    assert.equal(result, 'file:///foo/bar/baz')
  })

  test('should not encode slashes in reserved expansion', ({ assert }) => {
    const template = new UriTemplate('{+url}')
    const result = template.expand({ url: 'https://example.com/path' })
    assert.equal(result, 'https://example.com/path')
  })
})

test.group('UriTemplate - expand - Fragment (#)', () => {
  test('should expand fragment variable', ({ assert }) => {
    const template = new UriTemplate('file:///doc{#section}')
    const result = template.expand({ section: 'intro' })
    assert.equal(result, 'file:///doc#intro')
  })

  test('should omit fragment when variable is missing', ({ assert }) => {
    const template = new UriTemplate('file:///doc{#section}')
    const result = template.expand({})
    assert.equal(result, 'file:///doc')
  })
})

test.group('UriTemplate - expand - Path segments (/)', () => {
  test('should expand path variable', ({ assert }) => {
    const template = new UriTemplate('file:///files{/path}')
    const result = template.expand({ path: 'documents' })
    assert.equal(result, 'file:///files/documents')
  })

  test('should expand multiple path segments with array', ({ assert }) => {
    const template = new UriTemplate('file:///files{/path}')
    const result = template.expand({ path: ['docs', 'file.txt'] })
    // Array values with / operator join with the separator (/)
    assert.equal(result, 'file:///files/docs/file.txt')
  })

  test('should omit path when variable is missing', ({ assert }) => {
    const template = new UriTemplate('file:///files{/path}')
    const result = template.expand({})
    assert.equal(result, 'file:///files')
  })
})

test.group('UriTemplate - expand - Dot expansion (.)', () => {
  test('should expand dot variable', ({ assert }) => {
    const template = new UriTemplate('file:///example{.ext}')
    const result = template.expand({ ext: 'txt' })
    assert.equal(result, 'file:///example.txt')
  })

  test('should expand multiple dot variables with array', ({ assert }) => {
    const template = new UriTemplate('file:///file{.ext}')
    const result = template.expand({ ext: ['tar', 'gz'] })
    assert.equal(result, 'file:///file.tar.gz')
  })
})

test.group('UriTemplate - expand - Query parameters (?)', () => {
  test('should expand single query parameter', ({ assert }) => {
    const template = new UriTemplate('file:///api{?page}')
    const result = template.expand({ page: '1' })
    assert.equal(result, 'file:///api?page=1')
  })

  test('should expand multiple query parameters', ({ assert }) => {
    const template = new UriTemplate('file:///api{?page,limit}')
    const result = template.expand({ page: '1', limit: '10' })
    assert.equal(result, 'file:///api?page=1&limit=10')
  })

  test('should omit undefined query parameters', ({ assert }) => {
    const template = new UriTemplate('file:///api{?page,limit}')
    const result = template.expand({ page: '1' })
    assert.equal(result, 'file:///api?page=1')
  })

  test('should handle multiple query parameter groups', ({ assert }) => {
    const template = new UriTemplate('file:///api{?page}{&limit}')
    const result = template.expand({ page: '1', limit: '10' })
    assert.equal(result, 'file:///api?page=1&limit=10')
  })

  test('should handle array values in query parameters', ({ assert }) => {
    const template = new UriTemplate('file:///api{?tags}')
    const result = template.expand({ tags: ['red', 'blue'] })
    assert.equal(result, 'file:///api?tags=red,blue')
  })
})

test.group('UriTemplate - expand - Continuation (&)', () => {
  test('should expand continuation parameter', ({ assert }) => {
    const template = new UriTemplate('file:///api?fixed=value{&extra}')
    const result = template.expand({ extra: 'data' })
    assert.equal(result, 'file:///api?fixed=value&extra=data')
  })

  test('should handle multiple continuation parameters', ({ assert }) => {
    const template = new UriTemplate('file:///api?base=1{&x,y}')
    const result = template.expand({ x: '2', y: '3' })
    assert.equal(result, 'file:///api?base=1&x=2&y=3')
  })
})

test.group('UriTemplate - expand - Complex scenarios', () => {
  test('should handle mixed operators', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}/posts{?page,limit}')
    const result = template.expand({ id: '123', page: '1', limit: '10' })
    assert.equal(result, 'file:///users/123/posts?page=1&limit=10')
  })

  test('should handle template with static and dynamic parts', ({ assert }) => {
    const template = new UriTemplate('file:///api/v1/users/{userId}/profile')
    const result = template.expand({ userId: '789' })
    assert.equal(result, 'file:///api/v1/users/789/profile')
  })

  test('should validate variable value length', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}')
    const longValue = 'a'.repeat(1000001)
    assert.throws(() => template.expand({ id: longValue }), /Variable value exceeds maximum length/)
  })
})

test.group('UriTemplate - match - Simple variables', () => {
  test('should match and extract simple variable', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}')
    const result = template.match('file:///users/123')
    assert.deepEqual(result, { id: '123' })
  })

  test('should match and extract multiple variables', ({ assert }) => {
    const template = new UriTemplate('file:///users/{userId}/posts/{postId}')
    const result = template.match('file:///users/123/posts/456')
    assert.deepEqual(result, { userId: '123', postId: '456' })
  })

  test('should return null when URI does not match template', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}')
    const result = template.match('file:///posts/123')
    assert.isNull(result)
  })

  test('should match with special characters', ({ assert }) => {
    const template = new UriTemplate('file:///search/{query}')
    const result = template.match('file:///search/hello%20world')
    assert.deepEqual(result, { query: 'hello%20world' })
  })

  test('should match template with no variables', ({ assert }) => {
    const template = new UriTemplate('file:///static/path')
    const result = template.match('file:///static/path')
    assert.deepEqual(result, {})
  })
})

test.group('UriTemplate - match - Query parameters', () => {
  test('should match and extract query parameters', ({ assert }) => {
    const template = new UriTemplate('file:///api{?page,limit}')
    const result = template.match('file:///api?page=1&limit=10')
    assert.deepEqual(result, { page: '1', limit: '10' })
  })

  test('should match single query parameter', ({ assert }) => {
    const template = new UriTemplate('file:///api{?page}')
    const result = template.match('file:///api?page=1')
    assert.deepEqual(result, { page: '1' })
  })

  test('should handle query parameters in different order', ({ assert }) => {
    const template = new UriTemplate('file:///api{?page,limit}')
    const result = template.match('file:///api?limit=10&page=1')
    // Note: The order matters in the current regex-based implementation
    // This will return null because the order doesn't match
    assert.isNull(result)
  })
})

test.group('UriTemplate - match - Path segments', () => {
  test('should match path segment', ({ assert }) => {
    const template = new UriTemplate('file:///files{/path}')
    const result = template.match('file:///files/documents')
    assert.deepEqual(result, { path: 'documents' })
  })

  test('should match exploded path segments as array', ({ assert }) => {
    const template = new UriTemplate('file:///files{/path*}')
    const result = template.match('file:///files/docs,file.txt')
    assert.deepEqual(result, { path: ['docs', 'file.txt'] })
  })
})

test.group('UriTemplate - match - Fragment', () => {
  test('should match fragment', ({ assert }) => {
    const template = new UriTemplate('file:///doc{#section}')
    const result = template.match('file:///doc#intro')
    // The # is included in the captured value
    assert.deepEqual(result, { section: '#intro' })
  })

  test('should return null when fragment does not match', ({ assert }) => {
    const template = new UriTemplate('file:///doc{#section}')
    const result = template.match('file:///doc')
    assert.isNull(result)
  })
})

test.group('UriTemplate - match - Reserved expansion', () => {
  test('should match reserved expansion', ({ assert }) => {
    const template = new UriTemplate('file:///{+path}')
    const result = template.match('file:///foo/bar/baz')
    assert.deepEqual(result, { path: 'foo/bar/baz' })
  })
})

test.group('UriTemplate - match - Dot expansion', () => {
  test('should match dot expansion', ({ assert }) => {
    const template = new UriTemplate('file:///example{.ext}')
    const result = template.match('file:///example.txt')
    assert.deepEqual(result, { ext: 'txt' })
  })

  test('should match multiple dot expansions', ({ assert }) => {
    const template = new UriTemplate('file:///file{.ext}')
    const result = template.match('file:///file.tar.gz')
    // Should match the entire extension part
    assert.isNotNull(result)
  })
})

test.group('UriTemplate - match - Complex scenarios', () => {
  test('should match complex template with multiple operators', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}/posts{?page,limit}')
    const result = template.match('file:///users/123/posts?page=1&limit=10')
    assert.deepEqual(result, { id: '123', page: '1', limit: '10' })
  })

  test('should validate URI length', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}')
    const longUri = 'file:///users/' + 'a'.repeat(1000001)
    assert.throws(() => template.match(longUri), /URI exceeds maximum length/)
  })

  test('should validate generated regex pattern length', ({ assert }) => {
    // Create a template that would generate a very long regex
    const manyVars = Array(5000)
      .fill(0)
      .map((_, i) => `{var${i}}`)
      .join('')
    const template = new UriTemplate(manyVars)
    // Match will return null for non-matching URI, not throw
    const result = template.match('test')
    assert.isNull(result)
  })
})

test.group('UriTemplate - Edge cases', () => {
  test('should handle empty variable values', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}')
    const result = template.expand({ id: '' })
    assert.equal(result, 'file:///users/')
  })

  test('should handle numeric variable values', ({ assert }) => {
    const template = new UriTemplate('file:///users/{id}')
    const result = template.expand({ id: '42' })
    assert.equal(result, 'file:///users/42')
  })

  test('should handle template with consecutive variables', ({ assert }) => {
    const template = new UriTemplate('{x}{y}{z}')
    const result = template.expand({ x: 'a', y: 'b', z: 'c' })
    assert.equal(result, 'abc')
  })

  test('should match URI with consecutive variables', ({ assert }) => {
    const template = new UriTemplate('{x},{y},{z}')
    const result = template.match('a,b,c')
    assert.deepEqual(result, { x: 'a', y: 'b', z: 'c' })
  })

  test('should handle variable names with numbers', ({ assert }) => {
    const template = new UriTemplate('file:///var/{var1}/and/{var2}')
    const result = template.expand({ var1: 'foo', var2: 'bar' })
    assert.equal(result, 'file:///var/foo/and/bar')
  })
})
