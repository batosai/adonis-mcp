/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Prompt } from '../../../src/server/prompt.js'
import type { PromptContext } from '../../../src/types/context.js'
import type { JSONSchema } from '../../../src/types/method.js'

export default class TestPromptNoSchema extends Prompt<JSONSchema> {
  name = 'test-prompt-no-schema'
  title = 'Test Prompt No Schema'
  description = 'Test prompt without schema'

  async handle({ response }: PromptContext) {
    return response.text('Hello from test prompt without schema')
  }
}

