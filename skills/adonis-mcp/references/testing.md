# Testing & Debugging — @jrmc/adonis-mcp

## Integration tests with FakeTransport (recommended)

Test the full JSON-RPC flow with Japa: create a `Server`, register components by path, connect a
`FakeTransport`, send the method under test with modern request metadata, and inspect
`transport.getLastMessage()`. Use `initialize` only when testing legacy compatibility.

```typescript
import type { CallToolResult, TextContent } from '@jrmc/adonis-mcp/types/jsonrpc'
import { test } from '@japa/runner'
import Server from '@jrmc/adonis-mcp/server'
import FakeTransport from '@jrmc/adonis-mcp/transports/fake_transport'
import app from '@adonisjs/core/services/app'

test.group('MCP Tool Integration', () => {
  test('should handle tool call end-to-end', async ({ assert }) => {
    const server = new Server({ name: 'Test Server', version: '1.0.0' })

    server.addTool({
      'my_tool': app.makePath('app/mcp/tools/my_tool_tool.ts'),
    })

    const transport = new FakeTransport()
    await server.connect(transport)

    await server.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'my_tool',
        arguments: { name: 'World' },
        _meta: {
          'io.modelcontextprotocol/protocolVersion': '2026-07-28',
          'io.modelcontextprotocol/clientCapabilities': {},
          'io.modelcontextprotocol/clientInfo': {
            name: 'test-client',
            version: '1.0.0',
          },
        },
      },
    })

    const result = transport.getLastMessage()?.result as CallToolResult
    const content = result?.content[0] as TextContent
    assert.equal(content.type, 'text')
    assert.include(content.text, 'Hello, World')
  })
})
```

### Registration methods and JSON-RPC calls per primitive

| Primitive | Registration | Method | Params | Result type |
|---|---|---|---|---|
| Tool | `server.addTool({ name: path })` | `tools/call` | `{ name, arguments }` | `CallToolResult` (`result.content[]`) |
| Resource | `server.addResource({ uri: path })` | `resources/read` | `{ uri }` | `ReadResourceResult` (`result.contents[]`, items have `uri`, `mimeType`, `text`) |
| Prompt | `server.addPrompt({ name: path })` | `prompts/get` | `{ name, arguments }` | `GetPromptResult` (`result.messages[]` with `role` + `content`) |

Resource templates: register with the template URI as key (`'file://{directory}/{name}.txt'`), then read with a concrete URI (`'file://production/config.txt'`) — variables are extracted automatically.

### Testing completions

```typescript
await server.handle({
  jsonrpc: '2.0',
  id: 2,
  method: 'completion/complete',
  params: {
    ref: { type: 'ref/resource', uri: 'file://{directory}/{name}.txt' }, // or type: 'ref/prompt', name: '...'
    argument: { name: 'name', value: 'a' },
  },
})
const result = transport.getLastMessage()?.result as CompleteResult
// result.completion.values is the suggestions array
```

### Testing protocol generations

For modern discovery, send `server/discover` with the same `_meta` envelope. Assert
`supportedVersions`, `resultType`, `_meta['io.modelcontextprotocol/serverInfo']`, `ttlMs`, and
`cacheScope`. Modern tool/resource/prompt results should receive the same response envelope.

`FakeTransport` tests server dispatch and response decoration but has no HTTP headers. Add an HTTP
integration test when validating `MCP-Protocol-Version`, `Mcp-Method`, `Mcp-Name`, or
`Mcp-Param-*`; mismatches must return HTTP 400 with `ErrorCode.HeaderMismatch` (-32020).

For legacy compatibility, send `initialize` with `protocolVersion`, `capabilities`, and
`clientInfo`; the `InitializeResult` exposes `serverInfo.name/version` and server capabilities.
Legacy results must not receive modern `resultType`, cache hints, or server `_meta` decoration.

Useful result types from `@jrmc/adonis-mcp/types/jsonrpc`: `DiscoverResult`, `InitializeResult`,
`CallToolResult`, `ReadResourceResult`, `GetPromptResult`, `ListPromptsResult`, `CompleteResult`,
`TextContent`, `TextResourceContents`.

## MCP Inspector (interactive debugging)

```bash
node ace mcp:inspector        # HTTP transport (default)
node ace mcp:inspector stdio  # stdio transport
```

Development environment only — it refuses to run in production. The command creates a writable
`.mcp-inspector.json` catalog at the application root when needed and preserves existing settings.
The `adonis-mcp-http` entry uses `protocolEra: 'modern'`; the `adonis-mcp-stdio` entry uses
`protocolEra: 'legacy'`. Do not commit credentials if the Inspector persists headers in the
catalog.
