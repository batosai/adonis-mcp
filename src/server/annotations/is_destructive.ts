/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { ToolAnnotations } from '../../types/jsonrpc.js'

import { Tool } from '../tool.js'
import { createError } from '@adonisjs/core/exceptions'

export function isDestructive(destructive: true | false = true) {
  return function <T extends { new (...args: any[]): { annotations?: ToolAnnotations } }>(
    constructor: T
  ) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args)
        if (!(this instanceof Tool)) {
          throw createError('@isDestructive decorator can only be applied to Tool classes', 'E_TOOL_DECORATOR')
        }
        if (!this.annotations) {
          this.annotations = {}
        }
        this.annotations.destructiveHint = destructive
      }
    }
  }
}
