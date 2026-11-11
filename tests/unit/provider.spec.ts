import { test } from '@japa/runner'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import Provider from '../../providers/mcp_provider.js'
import Server from '../../src/server.js'

test('discovery resolves constructor dependencies through the container', async ({ assert }) => {
  const root = await mkdtemp(join(tmpdir(), 'mcp-discovery-'))
  try {
    await writeFile(join(root, 'package.json'), '{"type":"module"}')
    for (const type of ['tool', 'resource', 'prompt']) {
      await mkdir(join(root, type + 's'))
      await writeFile(
        join(root, type + 's', 'injected_' + type + '.js'),
        'export default class { constructor(service) { this.name = service.name; this.uri = "test://resource" } toJson() { return { name: this.name } } }'
      )
    }
    const server = new Server({})
    const app = {
      rcFile: { directories: { mcp: root } },
      makePath: (...parts: string[]) => join(...parts),
      container: {
        make: async (target: any) =>
          target === 'jrmc.mcp' ? server : new target({ name: 'injected' }),
      },
    } as any
    const provider = new Provider(app)
    await provider.registerTools()
    await provider.registerResources()
    await provider.registerPrompts()
    assert.equal(server.tools.injected.json.name, 'injected')
    assert.equal(server.resources['test://resource'].json.name, 'injected')
    assert.equal(server.prompts.injected.json.name, 'injected')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
