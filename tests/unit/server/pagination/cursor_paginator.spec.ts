/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import { CursorPaginator } from '../../../../src/server/pagination/cursor_paginator.js'

test.group('CursorPaginator', () => {
  test('should paginate items without cursor', ({ assert }) => {
    const items = Array.from({ length: 30 }, (_, i) => `item-${i}`)
    const paginator = new CursorPaginator(items, 10)

    const result = paginator.paginate('items')

    assert.equal((result.items as string[]).length, 10)
    assert.equal((result.items as string[])[0], 'item-0')
    assert.equal((result.items as string[])[9], 'item-9')
    assert.exists(result.nextCursor)
  })

  test('should paginate items with cursor', ({ assert }) => {
    const items = Array.from({ length: 30 }, (_, i) => `item-${i}`)
    const firstPage = new CursorPaginator(items, 10)
    const firstResult = firstPage.paginate('items')

    const secondPage = new CursorPaginator(
      items,
      10,
      firstResult.nextCursor as string
    )
    const secondResult = secondPage.paginate('items')

    assert.equal((secondResult.items as string[]).length, 10)
    assert.equal((secondResult.items as string[])[0], 'item-10')
    assert.equal((secondResult.items as string[])[9], 'item-19')
  })

  test('should not include nextCursor when no more pages', ({ assert }) => {
    const items = Array.from({ length: 5 }, (_, i) => `item-${i}`)
    const paginator = new CursorPaginator(items, 10)

    const result = paginator.paginate('items')

    assert.equal((result.items as string[]).length, 5)
    assert.notExists(result.nextCursor)
  })

  test('should handle invalid cursor gracefully', ({ assert }) => {
    const items = Array.from({ length: 10 }, (_, i) => `item-${i}`)
    const paginator = new CursorPaginator(items, 5, 'invalid-cursor')

    const result = paginator.paginate('items')

    // Should start from beginning when cursor is invalid
    assert.equal((result.items as string[]).length, 5)
    assert.equal((result.items as string[])[0], 'item-0')
  })

  test('should use custom key for pagination result', ({ assert }) => {
    const items = Array.from({ length: 10 }, (_, i) => `item-${i}`)
    const paginator = new CursorPaginator(items, 5)

    const result = paginator.paginate('tools')

    assert.exists(result.tools)
    assert.notExists(result.items)
  })
})

