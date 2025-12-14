/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import { Resource } from '../../../../src/server/resource.js'
import { priority } from '../../../../src/server/annotations/priority.js'
import { audience } from '../../../../src/server/annotations/audience.js'
import { lastModified } from '../../../../src/server/annotations/last_modified.js'
import Text from '../../../../src/server/contents/text.js'
import Role from '../../../../src/enums/role.js'
import type { Annotations } from '../../../../src/types/jsonrpc.js'

class TestResource extends Resource {
  name = 'test'

  async handle() {
    return new Text('test')
  }
}

test.group('Resource Annotations - priority', () => {
  test('should set priority annotation', ({ assert }) => {
    @priority(0.8)
    class PriorityResource extends TestResource {}

    const resource = new PriorityResource()
    assert.exists(resource.annotations)
    assert.equal(resource.annotations?.priority, 0.8)
  })

  test('should accept priority value of 0', ({ assert }) => {
    @priority(0)
    class LowPriorityResource extends TestResource {}

    const resource = new LowPriorityResource()
    assert.exists(resource.annotations)
    assert.equal(resource.annotations?.priority, 0)
  })

  test('should accept priority value of 1', ({ assert }) => {
    @priority(1)
    class HighPriorityResource extends TestResource {}

    const resource = new HighPriorityResource()
    assert.exists(resource.annotations)
    assert.equal(resource.annotations?.priority, 1)
  })

  test('should throw error for priority less than 0', ({ assert }) => {
    assert.throws(() => {
      @priority(-0.1)
      class InvalidResource extends TestResource {}
      new InvalidResource()
    }, 'Priority must be a number between 0.0 and 1.0')
  })

  test('should throw error for priority greater than 1', ({ assert }) => {
    assert.throws(() => {
      @priority(1.1)
      class InvalidResource extends TestResource {}
      new InvalidResource()
    }, 'Priority must be a number between 0.0 and 1.0')
  })

  test('should throw error when applied to non-Resource class', ({ assert }) => {
    class NotAResource {
      annotations?: any
    }

    assert.throws(() => {
      @priority(0.5)
      class InvalidClass extends NotAResource {}
      new InvalidClass()
    }, '@priority decorator can only be applied to Resource classes')
  })
})

test.group('Resource Annotations - audience', () => {
  test('should set audience annotation with single role', ({ assert }) => {
    @audience(Role.USER)
    class UserResource extends TestResource {}

    const resource = new UserResource()
    assert.exists(resource.annotations)
    assert.isArray(resource.annotations?.audience)
    assert.lengthOf(resource.annotations?.audience!, 1)
    assert.deepEqual(resource.annotations?.audience, [Role.USER])
  })

  test('should set audience annotation with multiple roles', ({ assert }) => {
    @audience([Role.USER, Role.ASSISTANT])
    class MultiAudienceResource extends TestResource {}

    const resource = new MultiAudienceResource()
    assert.exists(resource.annotations)
    assert.isArray(resource.annotations?.audience)
    assert.lengthOf(resource.annotations?.audience!, 2)
    assert.deepEqual(resource.annotations?.audience, [Role.USER, Role.ASSISTANT])
  })

  test('should convert single role to array', ({ assert }) => {
    @audience(Role.ASSISTANT)
    class AssistantResource extends TestResource {}

    const resource = new AssistantResource()
    assert.exists(resource.annotations)
    assert.isArray(resource.annotations?.audience)
    assert.deepEqual(resource.annotations?.audience, [Role.ASSISTANT])
  })

  test('should throw error when applied to non-Resource class', ({ assert }) => {
    class NotAResource {
      annotations?: any
    }

    assert.throws(() => {
      @audience(Role.USER)
      class InvalidClass extends NotAResource {}
      new InvalidClass()
    }, '@audience decorator can only be applied to Resource classes')
  })
})

test.group('Resource Annotations - lastModified', () => {
  test('should set lastModified annotation', ({ assert }) => {
    const timestamp = '2024-12-12T10:00:00Z'
    @lastModified(timestamp)
    class ModifiedResource extends TestResource {}

    const resource = new ModifiedResource()
    assert.exists(resource.annotations)
    assert.equal(resource.annotations?.lastModified, timestamp)
  })

  test('should accept any string format', ({ assert }) => {
    const customFormat = '2024-12-12'
    @lastModified(customFormat)
    class CustomResource extends TestResource {}

    const resource = new CustomResource()
    assert.exists(resource.annotations)
    assert.equal(resource.annotations?.lastModified, customFormat)
  })

  test('should throw error when applied to non-Resource class', ({ assert }) => {
    class NotAResource {
      annotations?: any
    }

    assert.throws(() => {
      @lastModified('2024-12-12T10:00:00Z')
      class InvalidClass extends NotAResource {}
      new InvalidClass()
    }, '@lastModified decorator can only be applied to Resource classes')
  })
})

test.group('Resource Annotations - Multiple decorators', () => {
  test('should allow multiple annotations on same resource', ({ assert }) => {
    @priority(0.9)
    @audience(Role.USER)
    class MultiAnnotatedResource extends TestResource {}

    const resource = new MultiAnnotatedResource()
    assert.exists(resource.annotations)
    assert.equal(resource.annotations?.priority, 0.9)
    assert.deepEqual(resource.annotations?.audience, [Role.USER])
  })

  test('should allow all annotations on same resource', ({ assert }) => {
    const timestamp = '2024-12-12T10:00:00Z'
    @priority(0.7)
    @audience([Role.USER, Role.ASSISTANT])
    @lastModified(timestamp)
    class FullyAnnotatedResource extends TestResource {}

    const resource = new FullyAnnotatedResource()
    assert.exists(resource.annotations)
    assert.equal(resource.annotations?.priority, 0.7)
    assert.deepEqual(resource.annotations?.audience, [Role.USER, Role.ASSISTANT])
    assert.equal(resource.annotations?.lastModified, timestamp)
  })

  test('should preserve existing annotations property', ({ assert }) => {
    class PreAnnotatedResource extends Resource {
      name = 'pre-annotated'
      annotations: Annotations = { priority: 0.5 }

      async handle() {
        return new Text('test')
      }
    }

    @audience(Role.USER)
    class DecoratedPreAnnotatedResource extends PreAnnotatedResource {}

    const resource = new DecoratedPreAnnotatedResource()
    assert.exists(resource.annotations)
    assert.equal(resource.annotations?.priority, 0.5)
    assert.deepEqual(resource.annotations?.audience, [Role.USER])
  })
})

