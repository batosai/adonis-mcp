# MCP 2026-07-28

Version 2 supports the stateless MCP `2026-07-28` protocol while retaining compatibility with
`2025-11-25` and `2025-06-18` clients.

## Modern requests

Every HTTP request includes routing headers and a self-contained metadata envelope:

```http
POST /mcp HTTP/1.1
Content-Type: application/json
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: get_weather
```

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": { "city": "Paris" },
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientCapabilities": {},
      "io.modelcontextprotocol/clientInfo": {
        "name": "example-client",
        "version": "1.0.0"
      }
    }
  }
}
```

`Mcp-Name` is required for `tools/call`, `prompts/get`, and `resources/read`. Tools may additionally
mark primitive JSON Schema properties with `x-mcp-header` to require a matching
`Mcp-Param-{Name}` header.

## Discovery

Modern clients may call `server/discover` to retrieve supported versions, capabilities,
instructions, and server identity. Discovery is optional for clients but mandatory for servers.

The old `initialize` and `ping` methods remain available only to legacy clients.

## Response metadata

Successful modern responses include:

- `resultType: "complete"`
- `_meta["io.modelcontextprotocol/serverInfo"]`
- cache hints on discovery, list operations, and `resources/read`

Legacy responses retain their previous wire format.

## Cache hints

Cacheable responses default to `ttlMs: 0` and `cacheScope: "private"`. Configure longer policies
only when the returned catalog or resource is safe to reuse:

```typescript
export default defineConfig({
  cache: {
    discover: { ttlMs: 60_000, scope: 'public' },
    tools: { ttlMs: 60_000, scope: 'private' },
    resources: { ttlMs: 30_000, scope: 'private' },
    resourceTemplates: { ttlMs: 60_000, scope: 'private' },
    prompts: { ttlMs: 60_000, scope: 'private' },
  },
})
```

Use `private` whenever authentication or Bouncer permissions can change a response.

## Handler context

Handlers can inspect the request generation and modern client metadata through:

```typescript
ctx.protocolEra
ctx.protocolVersion
ctx.clientCapabilities
ctx.clientInfo
ctx.logLevel
```
