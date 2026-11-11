import { test } from '@japa/runner'
import { PassThrough } from 'node:stream'
import Transport from '../../../../src/server/transports/stdio_transport.js'
import Server from '../../../../src/server.js'

test('stdio recovers after invalid JSON and null in the same chunk', async ({ assert }) => {
  const input = new PassThrough()
  const output = new PassThrough()
  const transport = new Transport(input, output)
  const server = new Server({})
  const pending: Promise<unknown>[] = []
  let result = ''
  output.on('data', (chunk) => {
    result += chunk
  })
  transport.on('mcp:stdio:transport:message', (message) => {
    pending.push(server.handle(message, transport))
  })
  input.write('invalid\nnull\n{"jsonrpc":"2.0","id":1,"method":"ping"}\n')
  await Promise.all(pending)
  const responses = result
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line))
  assert.deepEqual(
    responses.map((r) => r.error?.code ?? r.id),
    [-32700, -32600, 1]
  )
  transport.close()
})

test('stdio buffers split messages and cleans up on EOF', async ({ assert }) => {
  const input = new PassThrough()
  const output = new PassThrough()
  const transport = new Transport(input, output)
  const messages: unknown[] = []
  transport.on('mcp:stdio:transport:message', (message) => messages.push(message))
  input.write('{"jsonrpc":')
  assert.isEmpty(messages)
  const ended = new Promise<void>((resolve) => transport.once('mcp:stdio:transport:end', resolve))
  input.end('"2.0","id":2,"method":"ping"}\n')
  await ended
  assert.lengthOf(messages, 1)
  assert.equal(input.listenerCount('data'), 0)
  assert.equal(input.listenerCount('end'), 0)
})
