# MCP Inspector

The MCP Inspector is a powerful tool for debugging and testing your MCP server. It provides a graphical interface to interact with your tools, resources, and prompts during development.

## Starting the Inspector

To open the MCP Inspector, use the following command:

```bash
node ace mcp:inspector
```

By default, this command uses HTTP transport. You can specify a different transport type:

```bash
# Use HTTP transport (default)
node ace mcp:inspector http

# Use stdio transport
node ace mcp:inspector stdio
```

## Server Catalog

The command uses a writable `.mcp-inspector.json` catalog at the root of your application. It
creates the file and the requested server entry when they do not exist. Existing entries and
settings are preserved, so changes made in the Inspector remain available between launches.

The HTTP entry uses the modern stateless protocol era by default:

```json
{
  "mcpServers": {
    "adonis-mcp-http": {
      "type": "http",
      "url": "http://localhost:3333/mcp",
      "protocolEra": "modern"
    }
  }
}
```

Running `node ace mcp:inspector stdio` adds a separate `adonis-mcp-stdio` entry configured for the
legacy protocol era. The catalog is compatible with both AdonisJS 6 and AdonisJS 7 because its
location does not depend on framework-generated directories.

The Inspector may store headers or other local connection settings in this file. Do not commit
credentials; add `.mcp-inspector.json` to your `.gitignore` when it contains local secrets.

## Requirements

::: warning Important
The inspector can only be used in development environment (not in production). If you try to run it in production, you'll receive an error message.
:::
