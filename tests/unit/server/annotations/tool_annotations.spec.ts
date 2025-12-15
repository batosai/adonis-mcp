/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import { Tool } from '../../../../src/server/tool.js'
import { isReadOnly } from '../../../../src/server/annotations/is_read_only.js'
import { isOpenWorld } from '../../../../src/server/annotations/is_open_world.js'
import { isDestructive } from '../../../../src/server/annotations/is_destructive.js'
import { isIdempotent } from '../../../../src/server/annotations/is_idempotent.js'
import Text from '../../../../src/server/contents/text.js'
import type { JSONSchema } from '../../../../src/types/method.js'
import type { ToolAnnotations } from '../../../../src/types/jsonrpc.js'

class TestTool extends Tool<JSONSchema> {
  name = 'test'

  async handle() {
    return new Text('test')
  }
}

test.group('Tool Annotations - isReadOnly', () => {
  test('should set readOnlyHint to true by default', ({ assert }) => {
    @isReadOnly()
    class ReadOnlyTool extends TestTool {}

    const tool = new ReadOnlyTool()
    assert.exists(tool.annotations)
    assert.isTrue(tool.annotations?.readOnlyHint)
  })

  test('should set readOnlyHint to false when specified', ({ assert }) => {
    @isReadOnly(false)
    class NotReadOnlyTool extends TestTool {}

    const tool = new NotReadOnlyTool()
    assert.exists(tool.annotations)
    assert.isFalse(tool.annotations?.readOnlyHint)
  })

  test('should set readOnlyHint to true when explicitly specified', ({ assert }) => {
    @isReadOnly(true)
    class ExplicitReadOnlyTool extends TestTool {}

    const tool = new ExplicitReadOnlyTool()
    assert.exists(tool.annotations)
    assert.isTrue(tool.annotations?.readOnlyHint)
  })

  test('should throw error when applied to non-Tool class', ({ assert }) => {
    class NotATool {
      annotations?: any
    }

    assert.throws(() => {
      @isReadOnly()
      class InvalidClass extends NotATool {}
      new InvalidClass()
    }, '@isReadOnly decorator can only be applied to Tool classes')
  })
})

test.group('Tool Annotations - isOpenWorld', () => {
  test('should set openWorldHint to true by default', ({ assert }) => {
    @isOpenWorld()
    class OpenWorldTool extends TestTool {}

    const tool = new OpenWorldTool()
    assert.exists(tool.annotations)
    assert.isTrue(tool.annotations?.openWorldHint)
  })

  test('should set openWorldHint to false when specified', ({ assert }) => {
    @isOpenWorld(false)
    class NotOpenWorldTool extends TestTool {}

    const tool = new NotOpenWorldTool()
    assert.exists(tool.annotations)
    assert.isFalse(tool.annotations?.openWorldHint)
  })

  test('should set openWorldHint to true when explicitly specified', ({ assert }) => {
    @isOpenWorld(true)
    class ExplicitOpenWorldTool extends TestTool {}

    const tool = new ExplicitOpenWorldTool()
    assert.exists(tool.annotations)
    assert.isTrue(tool.annotations?.openWorldHint)
  })

  test('should throw error when applied to non-Tool class', ({ assert }) => {
    class NotATool {
      annotations?: any
    }

    assert.throws(() => {
      @isOpenWorld()
      class InvalidClass extends NotATool {}
      new InvalidClass()
    }, '@isOpenWorld decorator can only be applied to Tool classes')
  })
})

test.group('Tool Annotations - isDestructive', () => {
  test('should set destructiveHint to true by default', ({ assert }) => {
    @isDestructive()
    class DestructiveTool extends TestTool {}

    const tool = new DestructiveTool()
    assert.exists(tool.annotations)
    assert.isTrue(tool.annotations?.destructiveHint)
  })

  test('should set destructiveHint to false when specified', ({ assert }) => {
    @isDestructive(false)
    class NotDestructiveTool extends TestTool {}

    const tool = new NotDestructiveTool()
    assert.exists(tool.annotations)
    assert.isFalse(tool.annotations?.destructiveHint)
  })

  test('should set destructiveHint to true when explicitly specified', ({ assert }) => {
    @isDestructive(true)
    class ExplicitDestructiveTool extends TestTool {}

    const tool = new ExplicitDestructiveTool()
    assert.exists(tool.annotations)
    assert.isTrue(tool.annotations?.destructiveHint)
  })

  test('should throw error when applied to non-Tool class', ({ assert }) => {
    class NotATool {
      annotations?: any
    }

    assert.throws(() => {
      @isDestructive()
      class InvalidClass extends NotATool {}
      new InvalidClass()
    }, '@isDestructive decorator can only be applied to Tool classes')
  })
})

test.group('Tool Annotations - isIdempotent', () => {
  test('should set idempotentHint to true by default', ({ assert }) => {
    @isIdempotent()
    class IdempotentTool extends TestTool {}

    const tool = new IdempotentTool()
    assert.exists(tool.annotations)
    assert.isTrue(tool.annotations?.idempotentHint)
  })

  test('should set idempotentHint to false when specified', ({ assert }) => {
    @isIdempotent(false)
    class NotIdempotentTool extends TestTool {}

    const tool = new NotIdempotentTool()
    assert.exists(tool.annotations)
    assert.isFalse(tool.annotations?.idempotentHint)
  })

  test('should set idempotentHint to true when explicitly specified', ({ assert }) => {
    @isIdempotent(true)
    class ExplicitIdempotentTool extends TestTool {}

    const tool = new ExplicitIdempotentTool()
    assert.exists(tool.annotations)
    assert.isTrue(tool.annotations?.idempotentHint)
  })

  test('should throw error when applied to non-Tool class', ({ assert }) => {
    class NotATool {
      annotations?: any
    }

    assert.throws(() => {
      @isIdempotent()
      class InvalidClass extends NotATool {}
      new InvalidClass()
    }, '@isIdempotent decorator can only be applied to Tool classes')
  })
})

test.group('Tool Annotations - Multiple decorators', () => {
  test('should allow multiple annotations on same class', ({ assert }) => {
    @isReadOnly()
    @isIdempotent()
    class MultiAnnotatedTool extends TestTool {}

    const tool = new MultiAnnotatedTool()
    assert.exists(tool.annotations)
    assert.isTrue(tool.annotations?.readOnlyHint)
    assert.isTrue(tool.annotations?.idempotentHint)
  })

  test('should allow all annotations on same class', ({ assert }) => {
    @isReadOnly(true)
    @isOpenWorld(false)
    @isDestructive(false)
    @isIdempotent(true)
    class FullyAnnotatedTool extends TestTool {}

    const tool = new FullyAnnotatedTool()
    assert.exists(tool.annotations)
    assert.isTrue(tool.annotations?.readOnlyHint)
    assert.isFalse(tool.annotations?.openWorldHint)
    assert.isFalse(tool.annotations?.destructiveHint)
    assert.isTrue(tool.annotations?.idempotentHint)
  })

  test('should preserve existing annotations property', ({ assert }) => {
    class PreAnnotatedTool extends Tool<JSONSchema> {
      name = 'pre-annotated'
      annotations: ToolAnnotations = { title: 'Custom Title' }

      async handle() {
        return new Text('test')
      }
    }

    @isReadOnly()
    class DecoratedPreAnnotatedTool extends PreAnnotatedTool {}

    const tool = new DecoratedPreAnnotatedTool()
    assert.exists(tool.annotations)
    assert.isTrue(tool.annotations?.readOnlyHint)
    assert.equal(tool.annotations?.title, 'Custom Title')
  })
})
