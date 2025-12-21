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

## Requirements

::: warning Important
The inspector can only be used in development environment (not in production). If you try to run it in production, you'll receive an error message.
:::
