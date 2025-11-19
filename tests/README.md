# Tests for @jrmc/adonis-mcp

This test structure uses [Japa](https://japa.dev/) as the testing framework, which is the standard framework for AdonisJS packages.

## Structure

```
tests/
├── helpers/              # Helpers and fixtures to facilitate testing
│   ├── create_context.ts    # Helper to create test contexts
│   └── create_request.ts    # Helper to create JSON-RPC requests
├── unit/                 # Unit tests
│   └── server/
│       ├── context.spec.ts
│       ├── server.spec.ts
│       ├── exceptions/
│       ├── methods/
│       └── pagination/
└── integration/          # Integration tests (coming soon)
```

## Running tests

```bash
npm test
```

To run a specific file:

```bash
npm test tests/unit/server/context.spec.ts
```

## Available helpers

### `createTestContext()`
Creates an MCP context for tests with default values, allowing to override certain properties.

```typescript
import { createTestContext } from '../helpers/create_context.js'
import { createInitializeRequest } from '../helpers/create_request.js'

const request = createInitializeRequest()
const context = createTestContext(request, {
  serverName: 'Custom Server',
  tools: { 'my-tool': '/path/to/tool' }
})
```

### `createJsonRpcRequest()`
Creates a generic JSON-RPC request.

```typescript
import { createJsonRpcRequest } from '../helpers/create_request.js'

const request = createJsonRpcRequest('tools/list', { cursor: 'abc123' })
```

### `createInitializeRequest()`
Creates an MCP initialization request.

```typescript
import { createInitializeRequest } from '../helpers/create_request.js'

const request = createInitializeRequest('2025-06-18', 1)
```

### `FakeTransport`
Fake transport for testing the server without external dependencies.

```typescript
import FakeTransport from '../../src/server/transports/fake_transport.js'

const transport = new FakeTransport()
await server.connect(transport)
await server.handle(request)

const lastMessage = transport.getLastMessage()
assert.exists(lastMessage)
```

## Recommendations for adding new tests

1. **Unit tests**: Test each method/class in isolation
2. **Integration tests**: Test the complete flow with multiple components
3. **Coverage**: Aim for high code coverage (>80%)
4. **Naming**: Use descriptive names for tests
5. **Organization**: Group tests by feature with `test.group()`

## Implemented tests

- ✅ Tests for `initialize` - MCP server initialization
- ✅ Tests for `list_tools` - Tool listing with pagination
- ✅ Tests for `call_tool` - Tool calls (error handling)
- ✅ Tests for `Server` - Main server class
- ✅ Tests for `ServerContext` - Server context
- ✅ Tests for `CursorPaginator` - Cursor pagination
- ✅ Tests for `JsonRpcException` - Exception handling

## Tests to add (priorities)

- [ ] Tests for `list_resources` with pagination
- [ ] Tests for `list_prompts`
- [ ] Tests for `get_prompt`
- [ ] Tests for `read_resource`
- [ ] Tests for `ping`
- [ ] Tests for transports (stdio, http)
- [ ] End-to-end integration tests

