/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { Resource } from '../resource.js'
import type { Annotations } from '../../types/jsonrpc.js'

/**
 * Decorator to indicate when a resource was last updated
 * @param lastModified - An ISO 8601 timestamp string showing when the resource was last updated
 */
export function lastModified(lastModified: string) {
  return function <T extends { new (...args: any[]): { annotations?: Annotations } }>(
    constructor: T
  ) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args)
        if (!(this instanceof Resource)) {
          throw new Error('@lastModified decorator can only be applied to Resource classes')
        }
        if (!this.annotations) {
          this.annotations = {}
        }
        this.annotations.lastModified = lastModified
      }
    }
  }
}

