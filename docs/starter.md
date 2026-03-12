# Starter Kit

The AdonisJS MCP Starter Kit provides the smallest possible AdonisJS application pre-configured with MCP support. It is ideal when you want to build a **dedicated MCP server** with the minimum required setup.

::: tip When to use the Starter Kit
Use this starter kit when your goal is to create a **standalone MCP server** — a lightweight application whose sole purpose is to expose tools, resources, and prompts via the Model Context Protocol.

If you want to **add MCP capabilities to an existing AdonisJS application** (or a larger project with a database, authentication, views, etc.), it is better to start from an [official AdonisJS starter kit](https://docs.adonisjs.com/guides/getting-started/installation) and then install the `@jrmc/adonis-mcp` package on top of it. See the [Installation guide](/installation) for details.
:::

## What's Included

The starter kit ships with the strict minimum:

- **AdonisJS core** — framework foundation, HTTP server, bodyparser
- **@jrmc/adonis-mcp** — MCP provider, commands, and middleware
- **Japa** — test runner pre-configured with unit, functional, and browser suites
- **MCP directory** — a `mcp/` folder at the project root with `tools/`, `resources/`, and `prompts/` subdirectories ready to use
- **MCP middleware** — session management and content-type validation already wired up
- **Stdio transport** — a `bin/mcp.ts` entry point for running the server as a stdio process

No database, no authentication, no views — just the essentials to get an MCP server running.

## Installation

Create a new project using the starter kit:

```bash
npm init adonisjs@latest -- -K="batosai/adonisjs-mcp-starter-kit" my-mcp-server
```

Then move into the project and start the development server:

```bash
cd my-mcp-server
npm run dev
```

Your MCP server is now available at `http://localhost:3333/mcp`.

## Project Structure

```
my-mcp-server/
├── app/
│   ├── exceptions/
│   │   └── handler.ts
│   └── middleware/
│       ├── container_bindings_middleware.ts
│       └── mcp_middleware.ts
├── bin/
│   ├── console.ts
│   ├── mcp.ts              # Stdio transport entry point
│   ├── server.ts
│   └── test.ts
├── config/
│   ├── app.ts
│   ├── bodyparser.ts
│   ├── encryption.ts
│   ├── hash.ts
│   ├── logger.ts
│   └── mcp.ts              # MCP server configuration
├── mcp/
│   ├── tools/              # Your MCP tools go here
│   ├── resources/          # Your MCP resources go here
│   └── prompts/            # Your MCP prompts go here
├── start/
│   ├── env.ts
│   ├── kernel.ts
│   └── routes.ts
├── tests/
│   └── bootstrap.ts
├── adonisrc.ts
├── package.json
└── tsconfig.json
```

::: info Custom MCP directory
The starter kit uses `mcp/` at the project root (instead of the default `app/mcp/`) as the MCP directory. This is configured in `adonisrc.ts`:

```typescript
directories: {
  mcp: 'mcp',
}
```

You can change this to any path you prefer.
:::

## Key Files

### Routes — `start/routes.ts`

The MCP route is already registered with the MCP middleware applied:

```typescript
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.mcp().use(middleware.mcp())
```

### Kernel — `start/kernel.ts`

The MCP middleware is registered as a named middleware:

```typescript
export const middleware = router.named({
  mcp: () => import('#middleware/mcp_middleware'),
})
```

### MCP Config — `config/mcp.ts`

```typescript
import { defineConfig } from '@jrmc/adonis-mcp'

export default defineConfig({
  name: 'adonis-mcp-docs',
  version: '1.0.0',
  completions: true,
})
```

### Stdio Entry Point — `bin/mcp.ts`

The starter kit includes a `bin/mcp.ts` file that boots the application and launches the MCP server over stdio. This is useful for integrating with AI clients that communicate via standard input/output (e.g., Claude Desktop, Cursor):

```typescript
new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .ace()
  .handle(['mcp:start'])
```

## Getting Started

### 1. Create a Tool

Generate your first tool using the ace command:

```bash
node ace make:mcp-tool hello
```

This creates `mcp/tools/hello_tool.ts`. Edit it to implement your logic:

```typescript
import type { ToolContext } from '@jrmc/adonis-mcp/types/context'
import { Tool } from '@jrmc/adonis-mcp'

export default class HelloTool extends Tool {
  name = 'hello'
  description = 'Say hello'

  async handle({ response }: ToolContext) {
    return response.text('Hello from AdonisJS MCP!')
  }
}
```

### 2. Test with the Inspector

Launch the MCP Inspector to test your tools interactively:

```bash
node ace mcp:inspector
```

See [Inspector](/inspector) for more details.

### 3. Add More Capabilities

Use the ace generators to scaffold tools, resources and prompts:

```bash
node ace make:mcp-tool my_tool
node ace make:mcp-resource my_resource
node ace make:mcp-prompt my_prompt
```

## Links

- **Repository**: [github.com/batosai/adonisjs-mcp-starter-kit](https://github.com/batosai/adonisjs-mcp-starter-kit)
- **Installation guide**: [Installation](/installation)
- **Demo applications**: [Demos](/demos)