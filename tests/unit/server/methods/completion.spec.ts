import { test } from '@japa/runner'
import Completion from '../../../../src/server/methods/completion.js'
import { createTestContext } from '../../../helpers/create_context.js'
import type { CompleteContext } from '../../../../src/types/context.js'
import { ErrorCode } from '../../../../src/enums/error.js'

test('completes empty strings but rejects missing or non-string values', async ({ assert }) => {
  for (const value of ['', undefined, null, 0, false]) {
    const context = createTestContext(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'completion/complete',
        params: {
          ref: { type: 'ref/prompt', name: 'test' },
          argument: { name: 'language', value },
        },
      },
      {
        prompts: {
          test: {
            path: new URL('../../../fixtures/prompts/test_prompt_1.ts', import.meta.url).href,
            json: {},
          },
        },
      }
    ) as CompleteContext
    let called = false
    const app = {
      container: {
        make: () => ({}),
        call: (_obj: unknown, _method: string, [ctx]: CompleteContext[]) => {
          called = true
          assert.deepEqual(ctx.args, { language: '' })
          return { values: ['typescript'] }
        },
      },
    } as any
    if (value === '') {
      const response = await new Completion().handle(context, app)
      assert.deepEqual(response.result?.completion, { values: ['typescript'] })
      assert.isTrue(called)
    } else {
      try {
        await new Completion().handle(context, app)
        assert.fail('Expected invalid params')
      } catch (error) {
        assert.equal(error.code, ErrorCode.InvalidParams)
      }
      assert.isFalse(called)
    }
  }
})
