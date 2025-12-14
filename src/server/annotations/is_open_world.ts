/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Tool } from '../tool.js'
import type { ToolAnnotations } from '../../types/jsonrpc.js'

export function isOpenWorld(openWorld: true | false = true) {
  return function <T extends { new (...args: any[]): { annotations?: ToolAnnotations } }>(
    constructor: T
  ) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args)
        if (!(this instanceof Tool)) {
          throw new Error('@isOpenWorld decorator can only be applied to Tool classes')
        }
        if (!this.annotations) {
          this.annotations = {}
        }
        this.annotations.openWorldHint = openWorld
      }
    }
  }
}

