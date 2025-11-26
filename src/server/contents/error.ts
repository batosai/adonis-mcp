/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { Content } from '../content.js'

import Text from './text.js'
import { createError } from '@adonisjs/core/exceptions'

export default class Error extends Text implements Content {
  toPrompt(): never {
    throw createError(
      'Error content may not be used in prompts.',
      'E_ERROR_NOT_SUPPORTED'
    )
  }

  toResource(): never {
    throw createError(
      'Error content may not be used in resources.',
      'E_ERROR_NOT_SUPPORTED'
    )
  }
}