/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Resource } from '../resource.js'
import type { Annotations } from '../../types/jsonrpc.js'

/**
 * Decorator to indicate resource importance
 * @param priority - A numerical score between 0.0 and 1.0 indicating resource importance
 */
export function priority(priority: number) {
  if (priority < 0 || priority > 1) {
    throw new Error('Priority must be a number between 0.0 and 1.0')
  }

  return function <T extends { new (...args: any[]): { annotations?: Annotations } }>(
    constructor: T
  ) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args)
        if (!(this instanceof Resource)) {
          throw new Error('@priority decorator can only be applied to Resource classes')
        }
        if (!this.annotations) {
          this.annotations = {}
        }
        this.annotations.priority = priority
      }
    }
  }
}
