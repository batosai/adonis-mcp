/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { readFile, writeFile } from 'node:fs/promises'

type InspectorServer = Record<string, unknown>

type InspectorCatalog = Record<string, unknown> & {
  mcpServers: Record<string, InspectorServer>
}

function parseCatalog(contents: string): InspectorCatalog {
  const catalog = JSON.parse(contents) as unknown

  if (
    !catalog ||
    typeof catalog !== 'object' ||
    Array.isArray(catalog) ||
    !('mcpServers' in catalog) ||
    !catalog.mcpServers ||
    typeof catalog.mcpServers !== 'object' ||
    Array.isArray(catalog.mcpServers)
  ) {
    throw new TypeError('Inspector catalog must contain an mcpServers object')
  }

  return catalog as InspectorCatalog
}

export async function ensureInspectorServer(
  catalogPath: string,
  serverName: string,
  server: InspectorServer
) {
  let catalog: InspectorCatalog

  try {
    catalog = parseCatalog(await readFile(catalogPath, 'utf8'))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }

    catalog = { mcpServers: {} }
  }

  if (catalog.mcpServers[serverName]) {
    return
  }

  catalog.mcpServers[serverName] = server
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
}
