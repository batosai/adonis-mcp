/**
 * @jrmc/adonis-mcp
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

import { test } from '@japa/runner'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ensureInspectorServer } from '../../../src/utils/inspector_catalog.js'

test.group('Inspector catalog', () => {
  test('should create a missing catalog with the server', async ({ assert, cleanup }) => {
    const directory = await mkdtemp(join(tmpdir(), 'adonis-mcp-inspector-'))
    const catalogPath = join(directory, '.mcp-inspector.json')
    cleanup(() => import('node:fs/promises').then(({ rm }) => rm(directory, { recursive: true })))

    await ensureInspectorServer(catalogPath, 'adonis-mcp-http', {
      type: 'http',
      url: 'http://localhost:3333/mcp',
      protocolEra: 'modern',
    })

    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
    assert.deepEqual(catalog, {
      mcpServers: {
        'adonis-mcp-http': {
          type: 'http',
          url: 'http://localhost:3333/mcp',
          protocolEra: 'modern',
        },
      },
    })
  })

  test('should preserve an existing server configuration', async ({ assert, cleanup }) => {
    const directory = await mkdtemp(join(tmpdir(), 'adonis-mcp-inspector-'))
    const catalogPath = join(directory, '.mcp-inspector.json')
    cleanup(() => import('node:fs/promises').then(({ rm }) => rm(directory, { recursive: true })))

    await writeFile(
      catalogPath,
      JSON.stringify({
        mcpServers: {
          'adonis-mcp-http': {
            type: 'http',
            url: 'http://localhost:4000/mcp',
            protocolEra: 'auto',
          },
        },
      })
    )

    await ensureInspectorServer(catalogPath, 'adonis-mcp-http', {
      type: 'http',
      url: 'http://localhost:3333/mcp',
      protocolEra: 'modern',
    })

    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
    assert.equal(catalog.mcpServers['adonis-mcp-http'].url, 'http://localhost:4000/mcp')
    assert.equal(catalog.mcpServers['adonis-mcp-http'].protocolEra, 'auto')
  })

  test('should add a missing server without removing existing entries', async ({
    assert,
    cleanup,
  }) => {
    const directory = await mkdtemp(join(tmpdir(), 'adonis-mcp-inspector-'))
    const catalogPath = join(directory, '.mcp-inspector.json')
    cleanup(() => import('node:fs/promises').then(({ rm }) => rm(directory, { recursive: true })))

    await writeFile(
      catalogPath,
      JSON.stringify({ mcpServers: { existing: { type: 'http', url: 'https://example.com/mcp' } } })
    )

    await ensureInspectorServer(catalogPath, 'adonis-mcp-stdio', {
      type: 'stdio',
      command: 'node',
      args: ['ace.js', 'mcp:start'],
      protocolEra: 'legacy',
    })

    const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
    assert.property(catalog.mcpServers, 'existing')
    assert.deepInclude(catalog.mcpServers['adonis-mcp-stdio'], {
      type: 'stdio',
      protocolEra: 'legacy',
    })
  })
})
