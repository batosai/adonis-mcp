# Setup — @jrmc/adonis-mcp

## Two ways to start

**Dedicated MCP server** (app whose sole purpose is MCP):

```bash
npm init adonisjs@latest -- -K="batosai/adonisjs-mcp-starter-kit" my-mcp-server
```

The starter kit uses `mcp/` at the project root (not `app/mcp/`), pre-wires the MCP middleware and route, and ships a `bin/mcp.ts` stdio entry point.

**Existing AdonisJS app:**

```bash
node ace add @jrmc/adonis-mcp
```

The installer asks **"Is Vinejs used for validation?"** — answering Yes registers `@jrmc/adonis-mcp/vinejs_provider` and enables `request.validateUsing()` in handlers. To enable it later, add the provider manually to `adonisrc.ts`:

```typescript
providers: [
  // ...
  '@jrmc/adonis-mcp/vinejs_provider',
]
```

## Configuration — `config/mcp.ts`

```typescript
import { defineConfig } from '@jrmc/adonis-mcp'

export default defineConfig({
  name: 'adonis-mcp-server',
  version: '1.0.0',
  completions: true, // enable argument completions (default: false)
})
```

Custom MCP directory (default `app/mcp`) in `adonisrc.ts`:

```typescript
directories: {
  mcp: 'app/custom/mcp',
}
```

## HTTP route — `start/routes.ts`

```typescript
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router.mcp().use(middleware.mcp())          // defaults to /mcp
router.mcp('/custom-path').use(middleware.mcp())  // custom path
```

### ⚠️ CSRF — the #1 gotcha

If shield/CSRF is enabled, the MCP route **must** be excluded (MCP clients don't send CSRF tokens). In `config/shield.ts`:

```typescript
csrf: {
  enabled: true,
  exceptRoutes: ['/mcp'], // or your custom path
}
```

## MCP middleware & sessions (HTTP transport only)

Installation generates `app/middleware/mcp_middleware.ts`. It validates `Content-Type` (`application/json` or `text/event-stream`) and manages the `MCP-Session-Id` header:

- `initialize` request → generates a session ID (`crypto.randomUUID()`) and returns it in the `MCP-Session-Id` response header
- every other request → requires and echoes back the `MCP-Session-Id` header

Register it as a named middleware in `start/kernel.ts` if missing:

```typescript
export const middleware = router.named({
  mcp: () => import('#middleware/mcp_middleware'),
})
```

Customize the middleware for session storage (Redis expiry/validation), logging, or a different ID format. When running multiple instances, store session state in shared storage (Redis), not memory.

## Transports

- **HTTP** (default) — via `router.mcp()`; the only transport with session support.
- **stdio** — for AI clients like Claude Desktop/Cursor: run `node ace mcp:start`, or use the starter kit's `bin/mcp.ts` (Ignitor booting ace with `['mcp:start']`).
- **Fake** — testing only (see references/testing.md).

## Events

```typescript
// start/events.ts (node ace make:preload events)
import emitter from '@adonisjs/core/services/emitter'
import type { JsonRpcRequest, JsonRpcResponse } from '@jrmc/adonis-mcp/types/jsonrpc'

emitter.on('mcp:request', (request: JsonRpcRequest) => logger.info(request))
emitter.on('mcp:response', (response: JsonRpcResponse) => logger.info(response))
```
