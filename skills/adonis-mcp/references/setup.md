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
  cache: {
    tools: { ttlMs: 60_000, scope: 'private' },
  },
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

## MCP middleware and protocol generations

Installation generates `app/middleware/mcp_middleware.ts`. It validates the JSON content type and
selects the lifecycle from the request:

- `2026-07-28` → stateless; never requires or emits `MCP-Session-Id`
- legacy `initialize` → creates an `MCP-Session-Id`
- other legacy requests → require and echo `MCP-Session-Id`

Register it as a named middleware in `start/kernel.ts` if missing:

```typescript
export const middleware = router.named({
  mcp: () => import('#middleware/mcp_middleware'),
})
```

Keep the modern early return when customizing legacy session storage or logging. Modern requests
carry their version and client capabilities in `params._meta`, and HTTP requests also provide
`MCP-Protocol-Version` and `Mcp-Method` routing headers.

## Transports

- **HTTP** (default) — stateless for `2026-07-28`, with legacy session compatibility.
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
