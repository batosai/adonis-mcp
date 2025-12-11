/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Prompt } from '../../../src/server/prompt.js'
import type { PromptContext } from '../../../src/types/context.js'
import type { BaseSchema, InferJSONSchema } from '../../../src/types/method.js'
import Role from '../../../src/enums/role.js'

type Schema = BaseSchema<{
  text: { type: 'string' }
}>

type Context = PromptContext & { args: InferJSONSchema<Schema> }

export default class TestPrompt1 extends Prompt<Schema> {
  name = 'test-prompt-1'
  title = 'Test Prompt 1'
  description = 'First test prompt'
  role = Role.USER

  schema() {
    return {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text input',
        },
      },
      required: ['text'],
    } as Schema
  }

  async handle({ args, response }: Context) {
    return response.text(`Hello from test prompt 1: ${args.text}`)
  }
}
