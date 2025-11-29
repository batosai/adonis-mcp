/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'
import type { Prompt } from '../prompt.js'
import type { Resource } from '../resource.js'
import Text from './text.js'
import { createError } from '@adonisjs/core/exceptions'

export default class Error extends Text implements Content {
  toPrompt(_prompt: Prompt): never {
    throw createError(
      'Error content may not be used in prompts.',
      'E_ERROR_NOT_SUPPORTED'
    )
  }

  toResource(_resource: Resource): never {
    throw createError(
      'Error content may not be used in resources.',
      'E_ERROR_NOT_SUPPORTED'
    )
  }
}