# Authentication & Authorization — @jrmc/adonis-mcp

Integrates AdonisJS Auth and Bouncer into MCP handlers. The HTTP transport wraps `ctx.bouncer` in an `McpBouncer` that converts `E_AUTHORIZATION_FAILURE` into JSON-RPC errors (`ErrorCode.InvalidRequest`, -32600) — never catch authorization errors manually.

## Setup

1. **Install Bouncer** (if needed): `node ace add @adonisjs/bouncer`

2. **Augment `McpContext`** in `app/middleware/mcp_middleware.ts` (uncomment the generated block) — without it, `auth`/`bouncer` are untyped:

```typescript
import type { HttpContext } from '@adonisjs/core/http'
import type * as abilities from '#abilities/main'
import type { policies } from '#generated/policies'
import type McpBouncer from '@jrmc/adonis-mcp/bouncer'

declare module '@jrmc/adonis-mcp/types/context' {
  export interface McpContext {
    auth: {
      user: HttpContext['auth']['user']
    }
    bouncer: McpBouncer<
      Exclude<HttpContext['auth']['user'], undefined>,
      typeof abilities,
      typeof policies
    >
  }
}
```

3. **Apply middlewares to the route** in `start/routes.ts` (MCP middleware + auth so `ctx.auth` exists):

```typescript
router.mcp().use([middleware.mcp(), middleware.auth()])
// optional/guest auth:
router.mcp().use([middleware.mcp(), middleware.auth({ guards: ['api'] })])
```

## Usage in handlers (identical for tools, resources, prompts)

```typescript
async handle({ auth, bouncer, args, response }: ToolContext<Schema>) {
  // Auth
  const user = auth.user
  if (!user) return response.error('Not authenticated')

  // Ability — throws JSON-RPC error if denied
  await bouncer.authorize(viewAdmin)

  // Policy — the returned authorizer is also wrapped
  const post = await Post.findOrFail(args?.postId)
  await bouncer.with(PostPolicy).authorize('edit', post)

  // Non-throwing checks
  const canEdit = await bouncer.allows(editPost, post)
  const denied = await bouncer.denies(editPost, post)

  return response.text('ok')
}
```

## Rules

- **Always `await`** `authorize` / `allows` / `denies` / `execute` — a missing `await` produces an unhandled rejection instead of a JSON-RPC error response.
- The full Bouncer API is preserved: `execute`, `allows`, `denies`, `authorize`, `with`, `deny`.
- With the `declare module` augmentation, ability names and policy method arguments are fully type-checked.
