# Installation

To get started, install Adonis MCP into your project using the ace command:

```bash
node ace add @jrmc/adonis-mcp
```

The installer will ask **"Is Vinejs used for validation?"** (Yes / No). If you choose Yes, the VineJS provider is registered and you can use `request.validateUsing()` in your MCP handlers. See [Validation](/validation) for details.

This will create a configuration file `config/mcp.ts` and set up the necessary directories for your MCP implementation.

## Configuration

Server MCP configuration is located in the `config/mcp.ts` file. By default, the file looks like this:

```typescript
import { defineConfig } from '@jrmc/adonis-mcp'

export default defineConfig({
  name: 'adonis-mcp-server',
  version: '1.0.0',
})
```

### Configuration Options

- **name**: The name of your MCP server (used for identification)
- **version**: The version of your MCP server
- **completions**: Enable argument completions for prompts and resources (default: `false`)

Example with completions enabled:

```typescript
import { defineConfig } from '@jrmc/adonis-mcp'

export default defineConfig({
  name: 'adonis-mcp-server',
  version: '1.0.0',
  completions: true, // Enable completions
})
```

## Custom MCP Directory

By default, your MCP tools, resources, and prompts will be stored in `app/mcp`. If you want to use a different path, you can configure it in your `adonisrc.ts` file:

```typescript
directories: {
  mcp: 'app/custom/mcp', // Optional: custom path for MCP files (defaults to 'app/mcp')
}
```

## Registering the MCP Route

To expose your MCP server via HTTP, register the MCP route in your `start/routes.ts` file:

```typescript
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

// Register MCP route (defaults to /mcp)
router.mcp()
```

You can also specify a custom path and apply middleware:

```typescript
// With authentication middleware
router.mcp('/custom-mcp-path').use(middleware.auth())
```

### CSRF Protection

::: warning Important
If you have CSRF protection enabled in your application, you **must** exclude the MCP route from CSRF validation. MCP clients typically don't include CSRF tokens in their requests.

In your `config/shield.ts` file, add the MCP route to the CSRF exceptions:

```typescript
export const shieldConfig = defineConfig({
  csrf: {
    enabled: true,
    exceptRoutes: [
      '/mcp', // Or your custom MCP path
    ],
  },
})
```
:::
