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
  number: { type: "number" }
}>

type Context = PromptContext & { args: InferJSONSchema<Schema> }

export default class TestPrompt2 extends Prompt<Schema> {
  name = 'test-prompt-2'
  title = 'Test Prompt 2'
  description = 'Second test prompt'
  role = Role.ASSISTANT

  schema() {
    return {
      type: 'object',
      properties: {
        number: {
          type: 'number',
          description: 'Number input',
        },
      },
      required: [],
    } as Schema
  }

  async handle({ args, response }: Context) {
    return response.text(`Hello from test prompt 2: ${args.number ?? 'no number'}`)
  }
}

