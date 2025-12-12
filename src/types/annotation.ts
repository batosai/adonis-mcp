/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type Role from '../enums/role.js'

export type ToolAnnotations = {
  destructiveHint?: boolean
  idempotentHint?: boolean
  openWorldHint?: boolean
  readOnlyHint?: boolean
  title?: string
}

export type Annotations = {
  audience?: Role[]
  lastModified?: string
  priority?: number
}