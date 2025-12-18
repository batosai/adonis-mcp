/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type Role from '../../enums/role.js'
import type { Annotations } from '../../types/jsonrpc.js'

import { Resource } from '../resource.js'
import { createError } from '@adonisjs/core/exceptions'

/**
 * Decorator to specify the intended audience for a resource or tool
 * @param audience - A single Role or an array of Roles (Role.User, Role.Assistant, or both)
 */
export function audience(audience: Role | Role[]) {
  return function <T extends { new (...args: any[]): { annotations?: Annotations } }>(
    constructor: T
  ) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args)
        if (!(this instanceof Resource)) {
          throw createError('@audience decorator can only be applied to Resource classes', 'E_RESOURCE_DECORATOR')
        }
        if (!this.annotations) {
          this.annotations = {}
        }
        this.annotations.audience = Array.isArray(audience) ? audience : [audience]
      }
    }
  }
}
