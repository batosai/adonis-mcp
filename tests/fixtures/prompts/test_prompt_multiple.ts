/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Prompt } from '../../../src/server/prompt.js'
import type { PromptContext } from '../../../src/types/context.js'
import type { BaseSchema, InferJSONSchema } from '@jrmc/adonis-mcp/types/method'

type Schema = BaseSchema<{}>

type Context = PromptContext & { args: InferJSONSchema<Schema> }

export default class TestPromptMultiple extends Prompt<Schema> {
  name = 'test-prompt-multiple'
  title = 'Test Prompt Multiple'
  description = 'Test prompt that returns multiple contents'

  async handle({ response }: Context) {
    return [response.text('First message').asUser(), response.text('Second message').asAssistant()]
  }
}

