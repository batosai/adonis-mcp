# Testing & Debugging — @jrmc/adonis-mcp

## Integration tests with FakeTransport (recommended)

Test the full JSON-RPC flow with Japa: create a `Server`, register components by path, connect a `FakeTransport`, send `initialize`, then the method under test, and inspect `transport.getLastMessage()`.

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

    await server.handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })
    await server.handle({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: { name: 'my_tool', arguments: { name: 'World' } },
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

### Testing initialization/capabilities

Send `initialize` with `protocolVersion`, `capabilities`, `clientInfo`; the `InitializeResult` exposes `serverInfo.name/version` and `capabilities.tools/resources/prompts` (present when at least one component of that kind is registered).

Useful result types from `@jrmc/adonis-mcp/types/jsonrpc`: `InitializeResult`, `CallToolResult`, `ReadResourceResult`, `GetPromptResult`, `ListPromptsResult`, `CompleteResult`, `TextContent`, `TextResourceContents`.

## MCP Inspector (interactive debugging)

```bash
node ace mcp:inspector        # HTTP transport (default)
node ace mcp:inspector stdio  # stdio transport
```

Development environment only — it refuses to run in production.
