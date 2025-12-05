/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Prompt } from '../../../src/server/prompt.js'
import type { PromptContext } from '../../../src/types/context.js'
import type { JSONSchema } from '../../../src/types/method.js'

export default class TestPromptMultiple extends Prompt<JSONSchema> {
  name = 'test-prompt-multiple'
  title = 'Test Prompt Multiple'
  description = 'Test prompt that returns multiple contents'

  async handle({ response }: PromptContext) {
    return [response.text('First message').asUser(), response.text('Second message').asAssistant()]
  }
}
