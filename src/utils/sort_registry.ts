/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import type { McpRegistryEntry } from '../types/method.js'

export function sortRegistryEntries(registry: Record<string, McpRegistryEntry>) {
  return Object.entries(registry)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, entry]) => entry)
}
